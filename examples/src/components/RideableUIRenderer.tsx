import { useContext } from 'react';
import { GaesupContext } from '../../../src/gaesup/atoms';
import { RideableUI } from '../../../src';

export function RideableUIRenderer() {
  const { states } = useContext(GaesupContext);
  return <RideableUI states={states} />;
}
