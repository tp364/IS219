import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ChatShell } from "@/components/chat/chat-shell";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <ChatShell userEmail={session.user.email ?? "User"} />;
}
