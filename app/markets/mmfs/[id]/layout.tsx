import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { id } = await params;
  // Simple format mapping (e.g., 'etica' -> 'Etica')
  const fundName = id.charAt(0).toUpperCase() + id.slice(1) + " MMF";
  
  return {
    title: `${fundName} - Daily Yields & AI Analysis | Sentill Africa`,
    description: `Compare daily yields, management fees, and AI risk analysis for ${fundName}. Optimize your KES returns with Sentill.`,
    openGraph: {
      description: `Track daily effective yields and historical performance for ${fundName} with Sentill's institutional wealth terminal.`,
      url: `https://sentill.africa/markets/mmfs/${id}`,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(fundName)}&type=MMF`, 
          width: 1200,
          height: 630,
          alt: `${fundName} - Sentill Africa Analytics`
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${fundName} Yield Data`,
      description: `Live performance analysis for ${fundName}.`,
    }
  };
}

export default function MMFLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
