import Link from "next/link";
import { VisaForm } from "@/components/admin/VisaForm";

export const metadata = { title: "Add visa" };

export default function NewVisaPage() {
  return (
    <>
      <Link href="/admin/visas" className="text-sm text-brand-700 hover:underline">← Back to visas</Link>
      <h1 className="mt-2 mb-6 font-display text-3xl text-brand-900">Add visa</h1>
      <VisaForm />
    </>
  );
}
