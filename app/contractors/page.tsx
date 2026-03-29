'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const SERVICES = [
  { label: 'Plumber', value: 'plumber' },
  { label: 'Electrician', value: 'electrician' },
  { label: 'HVAC', value: 'hvac' },
  { label: 'Roofer', value: 'roofer' },
  { label: 'Painter', value: 'painter' },
  { label: 'Landscaper', value: 'landscaper' },
  { label: 'Cleaner', value: 'cleaner' },
  { label: 'Handyman', value: 'handyman' },
  { label: 'Locksmith', value: 'locksmith' },
  { label: 'Pest Control', value: 'pest-control' },
  { label: 'Mover', value: 'mover' },
  { label: 'Carpenter', value: 'carpenter' },
  { label: 'Flooring', value: 'flooring' },
  { label: 'Windows & Doors', value: 'windows-doors' },
  { label: 'Appliance Repair', value: 'appliance-repair' },
  { label: 'Pool Service', value: 'pool-service' },
  { label: 'Renovation', value: 'renovation' },
  { label: 'Other', value: 'other' },
];

function getServiceLabel(value: string): string {
  return SERVICES.find(s => s.value === value)?.label || value;
}

function getServiceByValue(value: string): string | null {
  const t = value.toLowerCase().trim();
  for (const s of SERVICES) {
    if (s.label.toLowerCase().includes(t) || t.includes(s.label.toLowerCase())) return s.value;
  }
  return null;
}

interface Contractor {
  _id: string;
  companyName: string;
  description: string;
  servicesOffered: string[];
  averageRating: number;
  reviewCount: number;
  isVerified: boolean;
  serviceLocations: { name: string; isActive: boolean }[];
  createdAt: string;
  isPreferred?: boolean;
  highlightAsPreferred?: boolean;
  calculatedDistance?: number;
  photos?: string[];
}

interface SearchState {
  searchTerm: string;
  serviceType: string;
  latitude: string;
  longitude: string;
  serviceZone: string;
  sort: string;
  order: string;
  minRating: string;
  verifiedOnly: boolean;
}

interface SearchResult {
  profiles: Contractor[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
        </svg>
      ))}
    </div>
  );
}

function ContractorCard({ contractor, onMessageClick }: { contractor: Contractor; onMessageClick: (c: Contractor) => void }) {
  const router = useRouter();
  const isPreferred = contractor.isPreferred || contractor.highlightAsPreferred;

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 hover:shadow-lg transition-all duration-300 overflow-hidden ${isPreferred ? 'border-yellow-400 bg-gradient-to-b from-yellow-50 to-orange-50' : 'border-gray-100'}`}>
      {isPreferred && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2">
          ⭐ Top Rated • {contractor.averageRating.toFixed(1)}★ • {contractor.reviewCount} reviews
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => router.push(`/contractor/${contractor._id}`)}>
            {contractor.companyName}
          </h3>
          {contractor.isVerified && <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">✓ Verified</span>}
        </div>
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={contractor.averageRating} />
          <span className="text-sm font-medium text-gray-700">{contractor.averageRating.toFixed(1)}</span>
          <span className="text-sm text-gray-500">({contractor.reviewCount} reviews)</span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{contractor.description}</p>
        <div className="flex flex-wrap gap-1 mb-4">
          {contractor.servicesOffered.slice(0, 3).map(s => (
            <span key={s} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">{getServiceLabel(s)}</span>
          ))}
          {contractor.servicesOffered.length > 3 && (
            <span className="text-xs text-gray-500 px-2 py-1">+{contractor.servicesOffered.length - 3} more</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          📍 {contractor.serviceLocations?.[0]?.name || 'Location not specified'}
        </div>
        <button onClick={() => onMessageClick(contractor)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors mb-2">
          Send Message
        </button>
        <button onClick={() => router.push(`/contractor/${contractor._id}`)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
          View Full Profile
        </button>
      </div>
    </div>
  );
}

function ContractorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [selectedContractors, setSelectedContractors] = useState<Contractor[]>([]);
  const [contractors, setContractors] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [searchState, setSearchState] = useState<SearchState>({
    searchTerm: '',
    serviceType: 'all',
    latitude: '',
    longitude: '',
    serviceZone: '',
    sort: 'average_rating',
    order: 'desc',
    minRating: '',
    verifiedOnly: false,
  });

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    setSearchState(prev => ({
      ...prev,
      searchTerm: params.searchTerm || '',
      serviceType: params.serviceType || 'all',
      latitude: params.latitude || '',
      longitude: params.longitude || '',
      serviceZone: params.serviceZone || '',
      sort: params.sort || 'average_rating',
      order: params.order || 'desc',
      minRating: params.minRating || '',
      verifiedOnly: params.verifiedOnly === 'true',
    }));
  }, [searchParams]);

  const fetchContractors = useCallback(async (state: SearchState) => {
    setLoading(true);
    setError(null);
    const supabase = getSupabaseClient();
    try {
      let query = supabase
        .from('contractors')
        .select('*', { count: 'exact' })
        .order('average_rating', { ascending: false })
        .limit(20);

      if (state.searchTerm) {
        query = query.or(`company_name.ilike.%${state.searchTerm}%,description.ilike.%${state.searchTerm}%`);
      }
      if (state.serviceType && state.serviceType !== 'all') {
        query = query.contains('services_offered', [state.serviceType]);
      }
      if (state.minRating) {
        query = query.gte('average_rating', parseFloat(state.minRating));
      }
      if (state.verifiedOnly) {
        query = query.eq('is_verified', true);
      }

      const { data, error: err, count } = await query;

      if (err) throw Error(err.message);

      const mapped: Contractor[] = (data || []).map((c: any) => ({
        _id: c.id,
        companyName: c.company_name || c.name || 'Unnamed',
        description: c.description || '',
        servicesOffered: c.services_offered || [],
        averageRating: c.average_rating || 0,
        reviewCount: c.review_count || 0,
        isVerified: c.is_verified || false,
        serviceLocations: c.service_locations || [],
        createdAt: c.created_at || '',
      }));

      setContractors({
        profiles: mapped,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: count || 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
      setHasMore(mapped.length === 20);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      fetchContractors(searchState);
    }
  }, [searchState, fetchContractors]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setSearchState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (searchState.searchTerm) params.set('searchTerm', searchState.searchTerm);
    if (searchState.serviceType !== 'all') params.set('serviceType', searchState.serviceType);
    if (searchState.sort) params.set('sort', searchState.sort);
    if (searchState.order) params.set('order', searchState.order);
    if (searchState.verifiedOnly) params.set('verifiedOnly', 'true');
    if (searchState.minRating) params.set('minRating', searchState.minRating);
    router.push(`/contractors?${params.toString()}`);
  };

  const handleShowMore = async () => {
    if (!contractors || !hasMore) return;
    setLoading(true);
    const supabase = getSupabaseClient();
    try {
      const offset = contractors.profiles.length;
      let query = supabase
        .from('contractors')
        .select('*', { count: 'exact' })
        .order('average_rating', { ascending: false })
        .range(offset, offset + 19);

      if (searchState.searchTerm) {
        query = query.or(`company_name.ilike.%${searchState.searchTerm}%,description.ilike.%${searchState.searchTerm}%`);
      }
      if (searchState.serviceType && searchState.serviceType !== 'all') {
        query = query.contains('services_offered', [searchState.serviceType]);
      }

      const { data, error: err } = await query;
      if (err) throw Error(err.message);

      const mapped: Contractor[] = (data || []).map((c: any) => ({
        _id: c.id,
        companyName: c.company_name || c.name || 'Unnamed',
        description: c.description || '',
        servicesOffered: c.services_offered || [],
        averageRating: c.average_rating || 0,
        reviewCount: c.review_count || 0,
        isVerified: c.is_verified || false,
        serviceLocations: c.service_locations || [],
        createdAt: c.created_at || '',
      }));

      setContractors(prev => prev ? {
        ...prev,
        profiles: [...prev.profiles, ...mapped],
        pagination: { ...prev.pagination, totalCount: prev.pagination.totalCount + mapped.length },
      } : null);
      setHasMore(mapped.length === 20);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (c: Contractor) => {
    setSelectedContractors([c]);
    setShowMessaging(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  name="searchTerm"
                  placeholder="Search contractors..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchState.searchTerm}
                  onChange={handleSearchChange}
                  onKeyPress={e => e.key === 'Enter' && handleSearchSubmit()}
                />
              </div>
              <select
                name="serviceType"
                value={searchState.serviceType}
                onChange={handleSearchChange}
                className="w-48 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Services</option>
                {SERVICES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <button onClick={handleSearchSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                Search
              </button>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                🔽 Filters
              </button>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-500">View:</span>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>▦</button>
                  <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>☰</button>
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="bg-gray-50 -mx-4 px-4 py-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Zone</label>
                    <input type="text" name="serviceZone" placeholder="e.g., Tirana, Durrës" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={searchState.serviceZone} onChange={handleSearchChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                    <select name="minRating" value={searchState.minRating} onChange={handleSearchChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">Any Rating</option>
                      <option value="4.5">4.5+ Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select name="sort" value={`${searchState.sort}_${searchState.order}`} onChange={handleSearchChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="average_rating_desc">Highest Rated</option>
                      <option value="review_count_desc">Most Reviews</option>
                      <option value="created_at_desc">Newest</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input type="checkbox" name="verifiedOnly" checked={searchState.verifiedOnly} onChange={handleSearchChange} className="rounded border-gray-300 text-blue-600" />
                      <span className="ml-2 text-sm text-gray-700">Verified Only</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {loading ? 'Searching...' : `${contractors?.profiles.length || 0} Contractors Found`}
            </h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading && !(contractors?.profiles.length) && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Finding best contractors...</span>
            </div>
          </div>
        )}

        {!loading && !(contractors?.profiles.length) && !error && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No contractors found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
          </div>
        )}

        {contractors?.profiles.length ? (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {contractors.profiles.map(c => (
                <ContractorCard key={c._id} contractor={c} onMessageClick={handleMessageClick} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button onClick={handleShowMore} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium">
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>

      {showMessaging && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Send Message</h2>
            <p className="text-gray-600 mb-4">Messaging to: {selectedContractors.map(c => c.companyName).join(', ')}</p>
            <textarea className="w-full border border-gray-300 rounded-lg p-3 mb-4" rows={4} placeholder="Your message..." id="msg-input" />
            <div className="flex gap-3">
              <button onClick={() => setShowMessaging(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg">Cancel</button>
              <button onClick={() => setShowMessaging(false)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContractorsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <ContractorsContent />
    </Suspense>
  );
}