import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name')
            .eq('role', 'owner')
            .limit(1)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Owner tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ id: data.id, name: data.full_name });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
