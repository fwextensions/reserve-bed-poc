import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	title: "Bed Reservation System",
	description: "Real-time bed reservation system for case workers and site administrators",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
			</head>
			<body>
				<ConvexClientProvider>{children}</ConvexClientProvider>
				<Toaster />
			</body>
		</html>
	);
}
