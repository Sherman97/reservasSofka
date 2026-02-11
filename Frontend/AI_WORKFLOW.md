# AI_WORKFLOW.md

En este documento se detallan las instrucciones para el uso del AI en el proyecto de reservas de habitaciones.

---

## 1. Configuración Inicial y Arquitectura

    - 1.1 Ya que el proyecto va ser "pequeño" se implementara una estructura de carpetas simple y ordenada por features, lo cual se le asigna un rol a la IA que asuma el rol de un desarrollador senior experto en React especialista en arquitectura basada en Component-View, lo cual debe seguir las mejores prácticas de desarrollo.

    - 1.2 Con el rol asignado se le pide que cree la estructura de carpetas y se verifica que lo creado sea correcto con la arquitectura propuesta.

---

## 2. Autenticación (Login & Signup)

    - 2.1 Mediante Google Stitch me apoye para la creacion de una UI para el login y signup que cumpla con los requisitos del proyecto.

![mockupLogin_Signup](image-1.png)

    - 2.2 Ya con el Mockup realizado de login/signup se le pide a la IA que implemente dicho mockup siguiendo la arquitectura propuesta.
    - 2.3 La IA divagar en la estructuracion del mockup ya que crea otra estructura de carpetas que no cumple con la arquitectura propuesta.
    - 2.4 Se le pide a la IA que verifique la arquitectura propuesta y que siga la misma en la implementacion del mockup.
    - 2.5 La IA no realiza aplica un diseño responsive y se le solicita que lo implemente.
    - 2.6 Se verifica que la implementacion sea correcta con la arquitectura propuesta.

---

## 3. Dashboard de Reservas

    - 3.1 Nuevamente desde Google stitch creo el mockup del dashboard de reservas.

![MockupDashboard](image-2.png)

    - 3.2 Le comparto dicho mockup de dashboard y le pido que implemente dicho mockup siguiendo la arquitectura propuesta.
    - 3.3 Se verifica que la implementacion sea correcta con la arquitectura propuesta y esta vez cumple con la arquitectura asignado y esperado, solo con un prompt.

---

## 4. Gestión de Reservas (Modal y Calendario)

    - 4.1 Mediante Google stitch genero un modal para la asignacion de reservas.

    - 4.2 Dicho mockup del modal se lo comparto a la IA para que implemente dicho modal siguiendo la arquitectura propuesta.

    - 4.3 En la implementacion del modal la IA falla en el diseño de la ui del calendario, se corrigue solo con un prompt.

![beforeMockupModal](image-3.png)
![afterMockupModal](image-4.png)

    - 4.4 Se verifica la implementacón y cumple con lo asignado.

---

## 5. Vista de Reservas Asignadas

    - 5.1 Mediante Google stitch genero el mockup de la page de la las reservas asignadas y ya que divaga en el diseño tomo solo la seccion que requiero.

    - 5.2 Comparto dicha seccion y solicito que cree la estructura de carpetas siguiendo con los mismo estilos.

![pageReseervations](image-5.png)

    - 5.3 La estructura generada no cumplio con lo requerido ya que ocultaba el header, para corregir dicho issue se soluciona con 2 prompts mas.

---

## 6. Componentes Adicionales y Assets

    - 6.1 Mediaante un prompt se crea el componente de paginación y su respectiva logica, en este caso se cumplio con lo asignado.

    - 6.2 Se le pide a la IA que haga uso de los assets (logos) para que sea consumido en el header.
## 7. Conexión a Backend

    - 7.1 Para que la IA no divague y no modifique el avance hecho se le solicita extrictamente que solo intervenga en los archivos donde se realiza la
    petición a la API.

    -7.2 Se le da la instruccion de que crear la logica de la peticion a la API para el login y signup.

        -7.2.1 La IA hardcodea la URL directamente en el archivo de la peticion a la API, se corrige manualmente.
