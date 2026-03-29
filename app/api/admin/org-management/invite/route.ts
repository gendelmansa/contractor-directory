import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Invite a user to the organization
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, role, inviterUserId, inviterOrgId } = body;
        
        if (!email || !role || !inviterUserId || !inviterOrgId) {
            return NextResponse.json(
                { error: 'Missing required fields: email, role, inviterUserId, inviterOrgId' },
                { status: 400 }
            );
        }
        
        if (!['admin', 'operator', 'contractor'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role. Must be admin, operator, or contractor' },
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
        
        // Create admin client
        const supabase = createClient(supabaseUrl, serviceKey);
        
        // Check if user is already in org members
        const { data: existingMember } = await supabase
            .from('organization_members')
            .select('id')
            .eq('organization_id', inviterOrgId)
            .eq('email', email.toLowerCase())
            .single();
        
        if (existingMember) {
            return NextResponse.json(
                { error: 'User is already a member of this organization' },
                { status: 400 }
            );
        }
        
        // Check if email already has auth account
        const { data: existingUser } = await supabase
            .from('auth.users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();
        
        // Create invitation record
        const { data: invitation, error: inviteError } = await supabase
            .from('contractor_invitations')
            .insert({
                organization_id: inviterOrgId,
                email: email.toLowerCase(),
                role: role,
                status: 'pending'
            })
            .select()
            .single();
        
        if (inviteError) {
            console.error('Invitation insert error:', inviteError);
            return NextResponse.json(
                { error: 'Failed to create invitation' },
                { status: 500 }
            );
        }
        
        // Generate invite link
        const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/join/${invitation.token}`;
        
        // If user exists, add to organization_members
        if (existingUser) {
            const { error: memberError } = await supabase
                .from('organization_members')
                .insert({
                    organization_id: inviterOrgId,
                    user_id: existingUser.id,
                    email: email.toLowerCase(),
                    role: role,
                    status: existingUser ? 'active' : 'pending',
                    invited_by: inviterUserId
                });
            
            if (memberError && memberError.code !== '23505') {
                console.error('Member insert error:', memberError);
            }
            
            // Create operator record if role is admin/operator
            if (role === 'admin' || role === 'operator') {
                const { data: existingOp } = await supabase
                    .from('operators')
                    .select('id')
                    .eq('user_id', existingUser.id)
                    .single();
                
                if (!existingOp) {
                    await supabase
                        .from('operators')
                        .insert({
                            user_id: existingUser.id,
                            organization_id: inviterOrgId,
                            role: role,
                            company_name: 'Pending Setup'
                        });
                }
            }
            
            // Create contractor profile if role is contractor
            if (role === 'contractor') {
                const { data: existingCp } = await supabase
                    .from('contractor_profiles')
                    .select('id')
                    .eq('user_id', existingUser.id)
                    .single();
                
                if (!existingCp) {
                    const { data: inviterOp } = await supabase
                        .from('operators')
                        .select('id')
                        .eq('user_id', inviterUserId)
                        .single();
                    
                    await supabase
                        .from('contractor_profiles')
                        .insert({
                            user_id: existingUser.id,
                            organization_id: inviterOrgId,
                            operator_id: inviterOp?.id || null,
                            email: email.toLowerCase(),
                            name: 'Pending Setup',
                            is_active: true
                        });
                }
            }
        }
        
        return NextResponse.json({
            success: true,
            invitation: invitation,
            inviteLink: inviteLink,
            userExists: !!existingUser
        });
        
    } catch (err: any) {
        console.error('Org invite error:', err);
        return NextResponse.json(
            { error: 'Internal server error: ' + err.message },
            { status: 500 }
        );
    }
}