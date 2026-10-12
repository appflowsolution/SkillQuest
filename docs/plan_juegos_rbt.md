# Plan de Desarrollo: Suite de Juegos Educativos RBT (iPad Web App)

## 1. Contexto Clínico y Destinatario
* **Población Objetivo:** Aprendices neurodivergentes (6 a 12 años / Terapia Pediátrica y Conductual).
* **Alcance Clínico:** Trastorno del Espectro Autista (TEA) y desafíos del neurodesarrollo afines (Comunicación funcional, regulación y funciones ejecutivas).
* **Entorno de Aplicación:** Sesiones de Terapia ABA facilitadas por técnicos de conducta (RBT) bajo supervisión analítico-conductual (BCBA).
* **Dispositivo de uso prioritario:** iPad (Tablet táctil horizontal / Safari Web App / PWA).
* **Premisa fundamental:** No utilizar juegos académicos estándar de aula que puedan detonar frustración o escape. Los juegos se centran en **comunicación funcional, funciones ejecutivas, tolerancia y habilidades sociales**.

---

## 2. Principios de Diseño y Arquitectura de la App

### Ergonomía y Touch para iPad
* **Orientación fija recomendada:** Paisaje (*Landscape*), ideal para iPad apoyado en soporte o sobre la mesa en sesión.
* **Touch Targets Generosos:** Botones interactivos principales de mínimo 64px a 80px de alto/ancho con bordes redondeados y feedback visual inmediato (cambio de escala/brillo).
* **Protección contra gestos accidentales:**
  * Desactivación de *pinch-to-zoom* (`user-scalable=no`, `touch-action: manipulation`).
  * Desactivación de selecciones de texto y llamadas contextuales de iOS (`user-select: none`, `-webkit-touch-callout: none`).
  * Prevención de scroll innecesario en pantallas de juego (`overflow: hidden`).
* **Audio y Feedback Sensorial:** Efectos de sonido claros y no estridentes sintetizados o cargados con Web Audio API (evitando bloqueos de autoplay de iOS Safari).

### Arquitectura Técnica
* **Framework:** React 19 + TypeScript + Vite + Tailwind CSS.
* **Componentes de Audio:** Web Audio API (efectos de éxito, tonos de alerta amigables, feedback táctil sonoro).
* **Modo Co-piloto RBT:** En cada juego existe una barra discreta (o menú desplegable sutil con acceso para la RBT) que permite:
  * Activar *prompts* (ayudas visuales o modelado).
  * Registrar intentos exitosos vs. asistidos.
  * Pausar o reiniciar la dinámica sin reiniciar la app.

---

## 3. Catálogo de los 6 Módulos Seleccionados

| N° | Nombre del Juego | Programa Clínico Asociado | Dominio Actual | Objetivo Central |
|---|---|---|---|---|
| **1** | **El Botón de Descanso** | *Break Request* (Skill 11) | 10% | Enseñar a pedir descanso funcional ("Break") antes de la frustración/escape. |
| **2** | **Un Minuto Más** | *Requesting More Time* (Skill 9) | 30% | Aprender a pedir prórroga de juego durante transiciones sin conducta disruptiva. |
| **3** | **Compañero de Turnos** | *Collaborative Play & Turn Taking* (Skills 7 y 8) | 40% y 90% | Compartir pantalla/mesa, tolerar la espera activa y jugar cooperativamente. |
| **4** | **Entrenador AAC / Toca y Guía** | *Accepting Guidance on AAC* (Skill 10) | 50% | Tolerar guía física en pantalla y familiarizarse con cuadrículas de comunicación. |
| **6** | **Pide Ayuda al Asistente** | *Requesting Help* (Skill 3) | 70% | Presionar "Ayuda" ante bloqueos o tareas difíciles en lugar de frustrarse. |
| **7** | **Laboratorio de Sonidos** | *Echoic / Vocal Imitation* (Skills 4 y 12) | 5% a 90% | Estimular imitación de fonemas simples ("aaa", "eee", "ooo") con refuerzo RBT. |

---

## 4. Detalle Específico: Dashboard Hub + Juego 1 (Break Request)

### A. Dashboard Hub (Menú de Selección)
* **Estilo Visual:** Interfaz moderna, limpia, estilo "estación de juegos/misiones espacial/arcade", atractiva para un preadolescente de 11 años sin ser infantil.
* **Tarjetas de Juego:** Tarjetas grandes con ilustraciones vectoriales vibrantes, títulos claros y badges de estado.
* **Panel de Configuración RBT:** Acceso protegido o discreto para ajustar volumen, ver registro de intentos y alternar modo de ayuda.

### B. Juego 1: "El Botón de Descanso" (*Break Quest*)
* **Escenario:** "Desafío de las Gemas/Gemas Estelares" — una actividad gratificante pero con dificultad progresiva (clasificar colores o emparejar patrones).
* **El Elemento Clave:** Un botón flotante permanente en la esquina inferior izquierda: **"NECESITO UN DESCANSO"** (icono de pausa/Break Card grande, color ámbar/azul suave).
* **Mecánica del Ensayo:**
  1. *Fase Activa:* El aprendiz juega emparejando o tocando gemas que suman puntos/estrellas.
  2. *Fase de Reto / Inducción de Demanda:* Tras 3-4 aciertos, aparece un patrón que requiere mayor atención o un reto más largo.
  3. *Prompt de la RBT o Automático:* Si el aprendiz se demora o la RBT presiona el botón discreto de "Sugerir Break", el botón de descanso emite un pulso luminoso suave.
  4. *Respuesta Esperada:* El aprendiz toca el botón "Break".
  5. *Refuerzo Inmediato:* La app celebra la petición (*"¡Muy bien por avisar! Tómate un respiro"*), detiene la música activa y abre la **Pantalla de Calma**.
  6. *Pantalla de Calma:* Animación suave de respiración o partículas flotantes con temporizador opcional de 30 a 60 segundos y botón verde para "Regresar a jugar cuando estés listo".
* **Métricas RBT registradas en sesión:**
  * Petición autónoma (*Independent*).
  * Petición asistida (*Prompted*).
  * Duración de la pausa antes de retomar.

---

## 5. Próximos Pasos de Implementación
1. Inicializar el proyecto con Vite + React 19 + TypeScript + Tailwind CSS.
2. Configurar diseño responsive bloqueado para iPad (touch viewport, ergonomía, assets de audio Web Audio).
3. Construir el **Dashboard Hub**.
4. Construir y probar el **Juego 1: El Botón de Descanso**.
5. Verificar y presentar al usuario para pruebas en iPad antes de avanzar al Juego 2.
