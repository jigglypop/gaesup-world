import { useGaesupContext } from '../../../src/gaesup/atoms';
import { RideableUI } from '../../../src/gaesup/component/rideable';

export function RideableUIRenderer() {
  const { states } = useGaesupContext();
  return <RideableUI states={states} />;
}
