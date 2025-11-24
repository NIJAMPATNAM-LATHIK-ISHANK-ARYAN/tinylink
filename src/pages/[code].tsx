import { GetServerSideProps } from "next";
import { prisma } from "../lib/prisma";


export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const code = ctx.params?.code as string | undefined;
  if (!code) return { notFound: true };

  // Find link by code
  const link = await prisma.link.findFirst({
    where: { code },
    select: {
      id: true,
      code: true,
      url: true,
      hitCount: true,
    },
  });

  if (!link) return { notFound: true };

  // Increment hit count
  await prisma.link.update({
    where: { code },
    data: { hitCount: { increment: 1 } },
  });

  // Redirect to long URL
  return {
    redirect: {
      destination: link.url,
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