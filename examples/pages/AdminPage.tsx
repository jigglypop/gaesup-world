import { GaesupAdmin } from 'gaesup-world/admin';

import { WorldPage } from './World';

export default function AdminPage() {
  return (
    <GaesupAdmin>
      <WorldPage showEditor showHud={false} />
    </GaesupAdmin>
  );
}
