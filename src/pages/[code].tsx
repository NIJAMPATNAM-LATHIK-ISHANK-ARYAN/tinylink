// src/pages/[code].tsx
import { GetServerSideProps } from "next";
import { prisma } from "../lib/prisma"; // relative import from src/pages

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const code = ctx.params?.code as string | undefined;
  if (!code) return { notFound: true };

const link = await prisma.link.findFirst({ where: { code } });
  if (!link) return { notFound: true };

  // increment clicks and set lastClicked
  await prisma.link.update({
    where: { code },
    data: { clicks: { increment: 1 }, lastClicked: new Date() },
  });

  return {
    redirect: {
      destination: link.target,
      permanent: false
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
