import { QrGenerator } from "@/components/QrGenerator";
import { QrScanner } from "@/components/QrScanner";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full m-4 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Generar
        </h1>

        <QrGenerator />
      </div>

      <div className="w-full m-4 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Escanear
        </h1>
        <QrScanner />
      </div>
    </main>
  );
}
