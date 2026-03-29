import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get organization members
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const orgId = searchParams.get('orgId');
        
        if (!userId || !orgId) {
            return NextResponse.json(
                { error: 'Missing userId or orgId' },
                { status: 400 }
            );
        }
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !serviceKey) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }
        
        const supabase = createClient(supabaseUrl, serviceKey);
        
        // Get organization
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', orgId)
            .single();
        
        if (orgError || !org) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }
        
        // Get org members with user info
        const { data: members, error: membersError } = await supabase
            .from('organization_members')
            .select(`
                *,
                users:user_id (id, email, created_at)
            `)
            .eq('organization_id', orgId)
            .order('joined_at', { ascending: true });
        
        if (membersError) {
            console.error('Members fetch error:', membersError);
            return NextResponse.json(
                { error: 'Failed to fetch members' },
                { status: 500 }
            );
        }
        
        // Get stats
        const { count: operatorCount } = await supabase
            .from('operators')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId);
        
        const { count: contractorCount } = await supabase
            .from('contractor_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId);
        
        const { count: jobCount } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId);
        
        // Get pending invitations
        const { data: invitations } = await supabase
            .from('contractor_invitations')
            .select('*')
            .eq('organization_id', orgId)
            .eq('status', 'pending');
        
        return NextResponse.json({
            organization: org,
            members: members || [],
            invitations: invitations || [],
            stats: {
                totalOperators: operatorCount || 0,
                totalContractors: contractorCount || 0,
                totalJobs: jobCount || 0
            }
        });
        
    } catch (err: any) {
        console.error('Org members error:', err);
        return NextResponse.json(
            { error: 'Internal server error: ' + err.message },
            { status: 500 }
        );
    }
}

// Update or remove member
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, memberId, newRole, newStatus, orgId, userId } = body;
        
        if (!action || !orgId || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !serviceKey) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }
        
        const supabase = createClient(supabaseUrl, serviceKey);
        
        if (action === 'updateRole') {
            if (!memberId || !newRole) {
                return NextResponse.json(
                    { error: 'Missing memberId or newRole' },
                    { status: 400 }
                );
            }
            
            // Update organization_members role
            const { error } = await supabase
                .from('organization_members')
                .update({ role: newRole })
                .eq('id', memberId)
                .eq('organization_id', orgId);
            
            if (error) {
                return NextResponse.json(
                    { error: 'Failed to update role' },
                    { status: 500 }
                );
            }
            
            // Also update operators table if applicable
            const { data: member } = await supabase
                .from('organization_members')
                .select('user_id')
                .eq('id', memberId)
                .single();
            
            if (member) {
                await supabase
                    .from('operators')
                    .update({ role: newRole })
                    .eq('user_id', member.user_id)
                    .eq('organization_id', orgId);
            }
            
            return NextResponse.json({ success: true });
        }
        
        if (action === 'updateStatus') {
            if (!memberId || !newStatus) {
                return NextResponse.json(
                    { error: 'Missing memberId or newStatus' },
                    { status: 400 }
                );
            }
            
            const { error } = await supabase
                .from('organization_members')
                .update({ status: newStatus })
                .eq('id', memberId)
                .eq('organization_id', orgId);
            
            if (error) {
                return NextResponse.json(
                    { error: 'Failed to update status' },
                    { status: 500 }
                );
            }
            
            return NextResponse.json({ success: true });
        }
        
        if (action === 'remove') {
            if (!memberId) {
                return NextResponse.json(
                    { error: 'Missing memberId' },
                    { status: 400 }
                );
            }
            
            // Get member to find user_id
            const { data: member } = await supabase
                .from('organization_members')
                .select('user_id')
                .eq('id', memberId)
                .single();
            
            // Delete from organization_members
            const { error } = await supabase
                .from('organization_members')
                .delete()
                .eq('id', memberId)
                .eq('organization_id', orgId);
            
            if (error) {
                return NextResponse.json(
                    { error: 'Failed to remove member' },
                    { status: 500 }
                );
            }
            
            // Remove operator record (don't delete auth user)
            if (member?.user_id) {
                await supabase
                    .from('operators')
                    .delete()
                    .eq('user_id', member.user_id)
                    .eq('organization_id', orgId);
            }
            
            return NextResponse.json({ success: true });
        }
        
        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
        
    } catch (err: any) {
        console.error('Org member action error:', err);
        return NextResponse.json(
            { error: 'Internal server error: ' + err.message },
            { status: 500 }
        );
    }
}