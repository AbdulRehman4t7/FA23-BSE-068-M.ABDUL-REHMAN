$content = Get-Content app/api/client/payments/route.ts -Raw
$content = $content + "

export const GET = withAuth(async (req: Request, user: UserSession) => {
  try {
    if (isDemoMode()) {
      const payments = mockListClientPayments(user.id);
      return NextResponse.json({ payments }, { status: 200 });
    }
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*, ads(title)')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ payments }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['CLIENT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']);"
Set-Content app/api/client/payments/route.ts -Value $content
