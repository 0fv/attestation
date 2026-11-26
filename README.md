# Android Attestation Status Proxy

基于 Vercel Edge Function 实现的反向代理，用于转发 Google Android Key Attestation 吊销状态列表接口：

- 上游地址：`https://android.googleapis.com/attestation/status`

## 支持路径

部署后，以下路径均可直接访问代理结果：

- `/`
- `/attestation/status`
- `/api/status`

## 特性

- **Vercel Edge Runtime**：低延迟、零冷启动、无需额外依赖
- **透传缓存验证头**：支持 `ETag` / `If-None-Match`、`Last-Modified` / `If-Modified-Since` 与 `304 Not Modified`
- **CORS 支持**：允许跨域调用（`GET` / `HEAD` / `OPTIONS`）

## 本地运行

```bash
npx vercel dev
```

然后访问：

```bash
curl -i http://localhost:3000/attestation/status
```

## 部署到 Vercel

```bash
npx vercel --prod
```

或直接将仓库导入 [Vercel Dashboard](https://vercel.com/new) 自动部署。
