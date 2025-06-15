import { useGaesupContext } from '../../src/core/stores/gaesupStore';
import { RideableUI } from '../../src/core/component/rideable';

export function RideableUIRenderer() {
  const { states } = useGaesupContext();
  return <RideableUI states={states} />;
}
