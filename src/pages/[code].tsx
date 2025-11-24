// src/pages/[code].ts
import { GetServerSideProps } from "next";
import { prisma } from "../lib/prisma";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const code = ctx.params?.code as string | undefined;

  if (!code) return { notFound: true };

  const link = await prisma.link.findFirst({
    where: { code },
    select: {
      id: true,
      target: true,
      clicks: true,
    },
  });

  if (!link) return { notFound: true };

  // update metrics
  await prisma.link.update({
    where: { code },
    data: { clicks: { increment: 1 }, lastClicked: new Date() },
  });

  return {
    redirect: {
      destination: link.target,
      permanent: false,
    },
  };
};

export default function RedirectPage() {
  return (
    <div style={{ padding: 40, fontSize: 18 }}>
      Redirecting...
    </div>
  );
}
