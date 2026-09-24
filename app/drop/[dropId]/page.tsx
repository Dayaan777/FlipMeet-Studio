import { redirect } from "next/navigation";

export async function generateStaticParams() {
  return [{ dropId: "drop-001" }];
}

export default async function DropPage() {
  redirect("/shop");
}
