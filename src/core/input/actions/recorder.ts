import type { InputActionMap } from './InputActionMap';
import type { InputRecording, InputRecordingFrame } from './types';

export class InputRecorder {
  private frames: InputRecordingFrame[] = [];
  private recording = false;

  start(): void {
    this.frames = [];
    this.recording = true;
  }

  capture(map: InputActionMap): void {
    if (this.recording) this.frames.push(map.captureFrame());
  }

  stop(): InputRecording {
    this.recording = false;
    return { version: 1, frames: this.frames };
  }

  isRecording(): boolean {
    return this.recording;
  }
}

export class InputReplay {
  private cursor = 0;

  constructor(private readonly recording: InputRecording) {}

  next(map: InputActionMap): boolean {
    const frame = this.recording.frames[this.cursor];
    if (!frame) {
      map.reset();
      return false;
    }
    map.applyRecordedFrame(frame);
    this.cursor++;
    return true;
  }

  isFinished(): boolean {
    return this.cursor >= this.recording.frames.length;
  }

  rewind(): void {
    this.cursor = 0;
  }
}
