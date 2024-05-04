// 10 MB
const MAX_HTTP_BUFFER_SIZE = 1e7;

export const MAX_EVENT_LISTENERS = 20;

export const ALLOWED_ORIGINS: string[] = [
    'http://localhost:4200',
    'https://admin.socket.io',
    'https://spot-seven.step.polymtl.ca',
    'https://polytechnique-montr-al.gitlab.io',
    'http://localhost:54727',
];

export const GATEWAY_CONFIGURATION_OBJECT = {
    cors: {
        origin: ALLOWED_ORIGINS,
        credentials: true,
    },
    maxHttpBufferSize: MAX_HTTP_BUFFER_SIZE,
};
