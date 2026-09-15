declare module 'swagger-ui-react' {
  import type { ComponentType } from 'react';

  type SwaggerUIProps = {
    url?: string;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelsExpandDepth?: number;
    persistAuthorization?: boolean;
  };

  const SwaggerUI: ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}
