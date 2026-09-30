# RESPUESTAS — FUNDAMENTOS DE INTELIGENCIA ARTIFICIAL

## Pregunta 1

La capacidad de identificar habilidades técnicas mediante inteligencia artificial debe integrarse como un servicio independiente del módulo que actualmente calcula la prioridad.

El flujo podría ser:

1. El backend recibe la carta de presentación.
2. Después de validar el contenido, el backend envía la información necesaria a un servicio de IA mediante una capa específica, por ejemplo `ai/skillsService`.
3. El servicio solicita al modelo únicamente la extracción estructurada de habilidades.
4. La respuesta del modelo se valida contra un esquema definido por el backend.
5. Las habilidades obtenidas se comparan con un catálogo controlado por la empresa.
6. El backend conserva únicamente habilidades válidas del catálogo.
7. El resultado puede almacenarse para auditoría y posteriores procesos de selección.
8. Las reglas determinísticas actuales pueden continuar funcionando de forma independiente.

La integración debe utilizar variables de entorno para las credenciales del proveedor, timeouts, manejo de errores y límites de consumo. La API principal no debería depender directamente de detalles específicos del proveedor de IA.

Si la operación de IA no es necesaria para responder inmediatamente al candidato, puede ejecutarse de forma asíncrona mediante una cola. Esto evita que una demora temporal del proveedor bloquee la creación de una postulación.

La salida del modelo nunca debe considerarse confiable por defecto. El backend debe validarla antes de utilizarla.

## Pregunta 2

Si el modelo devuelve un formato inválido, la respuesta debe rechazarse mediante una validación de esquema. El backend no debe intentar utilizar propiedades que no hayan sido validadas.

Para las habilidades, se debe utilizar un catálogo controlado por la empresa. Por ejemplo, si el catálogo contiene `Node.js`, `SQL` y `REST API`, una habilidad desconocida no debe convertirse automáticamente en una habilidad válida.

El flujo recomendado es:

1. Recibir la respuesta del modelo.
2. Validar el formato.
3. Validar tipos y campos obligatorios.
4. Comparar las habilidades con el catálogo permitido.
5. Eliminar o rechazar habilidades desconocidas según la política definida.
6. Registrar el incidente técnico para monitoreo.
7. Aplicar un fallback controlado cuando sea posible.
8. Evitar que una respuesta inválida modifique decisiones críticas.

Los reintentos solo deberían utilizarse para errores transitorios, como timeouts o respuestas temporales del proveedor. No deberían utilizarse indefinidamente ante respuestas estructuralmente inválidas.

El sistema también debe registrar suficiente información técnica para investigar el problema sin almacenar datos sensibles innecesarios.

## Pregunta 3

Para una decisión que afecta directamente a personas, no es recomendable sustituir sin controles las reglas determinísticas por una decisión completamente autónoma de un modelo de IA.

Las reglas determinísticas actuales permiten conocer exactamente por qué se asignó cada punto y prioridad. El mismo conjunto de datos produce el mismo resultado, lo que facilita auditoría, pruebas y explicación.

Un modelo de IA puede introducir problemas adicionales:

- menor reproducibilidad;
- dificultad para explicar determinadas decisiones;
- cambios de comportamiento entre versiones del modelo;
- posibles sesgos derivados de los datos o del modelo;
- dificultad para auditar cada decisión;
- dependencia de un proveedor externo;
- riesgos de privacidad y seguridad.

Una alternativa técnicamente más controlable es utilizar IA como apoyo para extraer información estructurada, mientras las reglas de decisión permanecen explícitas y auditables. También puede existir supervisión humana antes de tomar decisiones relevantes.

Si en el futuro se decide utilizar un modelo en la priorización, deberían existir como mínimo validación de entradas y salidas, registro de decisiones, pruebas periódicas, monitoreo de resultados, controles de acceso, mecanismos de revisión humana y una estrategia para revertir cambios del modelo.

La decisión final debe mantenerse trazable y debe poder explicarse con información verificable.
