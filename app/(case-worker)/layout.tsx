"use client";

export default function CaseWorkerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white border-b border-gray-200 sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
					<div>
						<h1 className="text-xl font-semibold">Bed Reservation</h1>
						<p className="text-sm text-gray-600">POC Mode - No Auth</p>
					</div>
				</div>
			</header>
			<main className="max-w-7xl mx-auto px-4 py-6">
				{children}
			</main>
		</div>
	);
}
