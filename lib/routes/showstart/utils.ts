import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';

const uuid = (length = 20) => {
    const e = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' + Date.now();
    const r: string[] = [];
    for (let i = 0; i < length; i++) {
        r.push(e.charAt(Math.floor(Math.random() * e.length)));
    }
    return r.join('');
};

const cookieMap = new Map([['token', uuid(32).toLowerCase()]]);

const devioceInfo = {
    vendorName: '',
    deviceMode: '',
    deviceName: '',
    systemName: '',
    systemVersion: '',
    cpuMode: ' ', // Note the space
    cpuCores: '',
    cpuArch: '',
    memerySize: '',
    diskSize: '',
    network: '',
    resolution: '1920*1080',
    pixelResolution: '',
};

const getAccessToken = async () => {
    const { result } = await post('/waf/gettoken');
    cookieMap.set('accessToken', result.accessToken.access_token);
    cookieMap.set('idToken', result.idToken.id_token);
    return cookieMap.get('accessToken');
};

const post = async (requestPath: string, accessToken = md5(Date.now().toString()), payload?: any) => {
    const traceId = uuid(32) + Date.now();

    const response = await ofetch(`https://www.showstart.com/api${requestPath}`, {
        method: 'POST',
        headers: {
            cdeviceinfo: encodeURIComponent(JSON.stringify(devioceInfo)),
            cdeviceno: cookieMap.get('token'),
            cookie: [...cookieMap.entries()].map(([key, value]) => `${key}=${value}`).join('; '),
            crpsign: md5(accessToken + /* sign/cusut (empty) + idToken (empty) + userInfo.userId (empty) + */ 'web' + cookieMap.get('token') + (payload ? JSON.stringify(payload) : '') + requestPath + '999web' + traceId),
            crtraceid: traceId,
            csappid: 'web',
            cterminal: 'web',
            cusat: accessToken,
            cusid: '',
            cusit: '',
            cusname: '',
            cusut: '',
            cversion: '999',
        } as HeadersInit,
        body: payload,
    });

    return response;
};

function sortBy(items: any[], key: string) {
    return items.sort((a, b) => {
        if (a[key] < b[key]) {
            return -1;
        }
        if (a[key] > b[key]) {
            return 1;
        }
        return 0;
    });
}

function uniqBy(items: any[], key: string) {
    const set = new Set();
    return items.filter((item) => {
        if (set.has(item[key])) {
            return false;
        }
        set.add(item[key]);
        return true;
    });
}

export { post, getAccessToken, uuid, sortBy, uniqBy };
