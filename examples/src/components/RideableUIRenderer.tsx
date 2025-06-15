import { useGaesupContext } from '../../../src/gaesup/stores/gaesupStore';
import { RideableUI } from '../../../src/gaesup/component/rideable';

export function RideableUIRenderer() {
  const { states } = useGaesupContext();
  return <RideableUI states={states} />;
}
