export type WorkerMessage = {
    type: 'INIT';
    sharedBuffer: SharedArrayBuffer;
} | {
    type: 'CONNECT';
    url: string;
    roomId: string;
    playerName: string;
    playerColor: string;
} | {
    type: 'DISCONNECT';
} | {
    type: 'SEND';
    payload: string;
};
