import { notFound } from 'next/navigation';
import { BRANCHES } from '@/config/branches';

export async function generateStaticParams() {
    return BRANCHES.map((branch) => ({
        branch: branch.slug,
    }));
}

export default function BranchLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { branch: string };
}) {
    const branch = BRANCHES.find((b) => b.slug === params.branch);

    if (!branch) {
        notFound();
    }

    return <>{children}</>;
}
