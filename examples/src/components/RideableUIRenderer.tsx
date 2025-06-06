import { useContext } from 'react';
import { GaesupContext } from '../../../src/gaesup/context';
import { RideableUI } from '../../../src/gaesup/tools/rideable';

export function RideableUIRenderer() {
  const { states } = useContext(GaesupContext);
  return <RideableUI states={states} />;
}
