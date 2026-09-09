import InvitationLandingView from "@/features/trip-planning/components/InvitationLandingView";
export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; return <InvitationLandingView token={token} />; }
