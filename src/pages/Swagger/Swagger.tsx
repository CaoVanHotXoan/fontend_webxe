import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './Swagger.module.css';

type ApiOperation = {
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: Array<{ name?: string; required?: boolean }>;
  responses?: Record<string, { description?: string }>;
};

type OpenApiDocument = {
  info?: { title?: string; description?: string };
  paths?: Record<string, Record<string, ApiOperation>>;
};

const methods = ['get', 'post', 'put', 'delete', 'patch'];

export default function SwaggerPage() {
  const [document, setDocument] = useState<OpenApiDocument | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/openapi.json')
      .then(async (response) => {
        if (!response.ok) throw new Error('Không thể tải tài liệu OpenAPI.');
        return response.json() as Promise<OpenApiDocument>;
      })
      .then(setDocument)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Không thể tải tài liệu API.'));
  }, []);

  const operations = document
    ? Object.entries(document.paths ?? {}).flatMap(([path, pathOperations]) => methods
      .filter((method) => pathOperations[method])
      .map((method) => ({ path, method, operation: pathOperations[method] })))
    : [];

  return (
    <div className={styles.page}>
      <Head>
        <title>Swagger API | WebXe</title>
      </Head>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>WEBXE DEVELOPER CENTER</p>
          <h1>Swagger API</h1>
          <p className={styles.subtitle}>Tra cứu và thử nghiệm các API của hệ thống WebXe.</p>
        </div>
        <div className={styles.actions}>
          <span className={styles.status}><i /> API documentation</span>
          <Link className={styles.backButton} href="/DatabaseDashboard/DatabaseDashboard">← Dashboard</Link>
        </div>
      </header>
      <main className={styles.content}>
        <section className={styles.infoBar}>
          <div><strong>WebXe Backend API</strong><span>OpenAPI 3.0.3</span></div>
          <p>Đăng nhập bằng Bearer token hoặc cookie HttpOnly để thử các endpoint cần xác thực.</p>
        </section>
        <section className={styles.swaggerPanel} aria-label="Tài liệu WebXe API">
          {!document && !error && <div className={styles.loading}>Đang tải tài liệu API...</div>}
          {error && <div className={styles.error}>{error}</div>}
          {document && <div className={styles.apiDocument}>
            <div className={styles.documentIntro}>
              <h2>{document.info?.title || 'WebXe API'}</h2>
              <p>{document.info?.description || 'Tài liệu các endpoint của WebXe backend.'}</p>
            </div>
            {operations.map(({ path, method, operation }) => (
              <article className={styles.endpoint} key={`${method}-${path}`}>
                <div className={styles.endpointHeading}>
                  <span className={`${styles.method} ${styles[method]}`}>{method.toUpperCase()}</span>
                  <code>{path}</code>
                  <strong>{operation.summary || 'API endpoint'}</strong>
                </div>
                {operation.description && <p>{operation.description}</p>}
                {operation.tags?.length ? <span className={styles.tag}>{operation.tags.join(', ')}</span> : null}
                {operation.parameters?.length ? <div className={styles.parameters}>Tham số: {operation.parameters.map((parameter) => `${parameter.name}${parameter.required ? ' *' : ''}`).join(', ')}</div> : null}
                <div className={styles.responses}>
                  {Object.entries(operation.responses ?? {}).map(([status, response]) => <span key={status}><b>{status}</b> {response.description || ''}</span>)}
                </div>
              </article>
            ))}
          </div>}
        </section>
      </main>
    </div>
  );
}
