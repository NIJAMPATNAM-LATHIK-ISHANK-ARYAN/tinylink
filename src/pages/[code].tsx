// src/pages/[code].tsx
import { GetServerSideProps } from "next";
import { prisma } from "../lib/prisma";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const code = ctx.params?.code as string | undefined;
  if (!code) return { notFound: true };

  const link = await prisma.link.findFirst({
    where: { code },
    select: {
      id: true,
      code: true,
      url: true,        // FIX
      hitCount: true,   // FIX
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!link) return { notFound: true };

  await prisma.link.update({
    where: { code },
    data: { hitCount: { increment: 1 } },
  });

  return {
    redirect: {
      destination: link.url,  // FIX
      permanent: false,
    },
  };
};

export default function RedirectPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting…</p>
    </div>
  );
}
