import Dashboard from '@/components/Dashboard';

export const metadata = {
  title: 'EV Charging Cost Calculator',
  description: 'Beregn om Clever One kan betale sig for dig.',
};

export default function Home() {
  return (
    <main>
      <Dashboard />
    </main>
  );
}
