import { Metadata } from 'next';

type Props = {
  params: Promise<{ symbol: string }>
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();
  
  return {
    title: `${symbol} - Live Market Data & AI Analysis | Sentill Africa`,
    description: `View real-time prices, charts, dividend yields, and institutional Sentill AI analysis for ${symbol} on the Nairobi Securities Exchange (NSE).`,
    openGraph: {
      title: `${symbol} - Live NSE Market Data & AI Analysis`,
      description: `Track ${symbol} performance, view historical charts, and deploy institutional alpha with Sentill.`,
      url: `https://sentill.africa/markets/nse/${symbol.toLowerCase()}`,
      images: [
        {
          url: `/api/og?title=${symbol}&type=Equity`, 
          width: 1200,
          height: 630,
          alt: `${symbol} - Sentill Africa Analytics`
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${symbol} - Live NSE Data`,
      description: `Institutional AI analysis and real-time yields for ${symbol}.`,
    }
  };
}

export default function NSEStockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
