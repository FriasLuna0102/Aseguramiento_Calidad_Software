# Carrito de Compras (CartShopping)

Este proyecto implementa un sistema básico de carrito de compras en Java, utilizando pruebas unitarias con JUnit 5 para garantizar la correcta funcionalidad de cada componente. Incluye las siguientes entidades:

- **Product**: Representa un producto con identificador, nombre y precio.
- **ItemCart**: Representa un ítem dentro del carrito, asociado a un producto, con cantidad y precio unitario.
- **Cart**: Contiene múltiples `ItemCart`, permite agregar/eliminar/actualizar ítems y calcula el total de la compra.

Además, cada clase cuenta con pruebas unitarias que cubren casos de éxito y de error para cada operación.

---

## Contenido

1. [Descripción](#descripción)
2. [Requisitos](#requisitos)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Instalación y compilación](#instalación-y-compilación)
5. [Ejecutar pruebas unitarias](#ejecutar-pruebas-unitarias)
6. [Descripción de las clases](#descripción-de-las-clases)
    - [Product](#product)
    - [ItemCart](#itemcart)
    - [Cart](#cart)
---

## Descripción

Este módulo demuestra cómo diseñar e implementar un carrito de compras utilizando principios de programación orientada a objetos en Java. Se incluyen validaciones en los constructores y métodos públicos, y se utiliza JUnit 5 para verificar:

- Construcción y validación de objetos (`Product`, `ItemCart`, `Cart`).
- Operaciones de carrito: agregar ítem, eliminar ítem, actualizar cantidad y limpiar carrito.
- Manejo de errores y excepciones (valores nulos, duplicados, cantidades inválidas).

El objetivo es que todas las pruebas unitarias pasen satisfactoriamente, asegurando que el código cumple con los requisitos de robustez, validaciones y lógica de negocio.

---

## Requisitos

- JDK 11 o superior (probado con OpenJDK 11).
- Gradle 6.0 o superior (o usar el wrapper incluido en el proyecto).
- JUnit 5 (ya configurado como dependencia en el build.gradle).

> **Nota**: Si prefieres usar Maven en lugar de Gradle, solo asegúrate de incluir las dependencias de JUnit 5 y configurar el directorio de pruebas en `src/test/java`.

---

## Estructura del proyecto

CartShopping/
├── build.gradle # Configuración de Gradle
├── settings.gradle # Inclusión del proyecto
├── src/
│ ├── main/
│ │ └── java/
│ │ └── org/
│ │ └── example/
│ │ └── cart_shopping/
│ │ └── entity/
│ │ ├── Cart.java
│ │ ├── ItemCart.java
│ │ └── Product.java
│ └── test/
│ └── java/
│ └── org/
│ └── example/
│ └── cart_shopping/
│ └── entity/
│ ├── CartTest.java
│ ├── ItemCartTest.java
│ └── ProductTest.java
├── .gitignore # Archivos ignorados por Git
└── README.md # Este documento


- `src/main/java/.../entity/`: contiene las clases de producción (`Product.java`, `ItemCart.java`, `Cart.java`).
- `src/test/java/.../entity/`: contiene las pruebas unitarias en JUnit 5 para cada clase.

---

## Instalación y compilación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/CartShopping.git
   cd CartShopping

2. **Compilar el proyecto**
   ```bash
   ./gradlew build
   ```

## Ejecutar pruebas unitarias
Para ejecutar las pruebas unitarias, utiliza el siguiente comando:

```bash
./gradlew test
 ```
Para ver los resultados de las pruebas, puedes revisar el reporte generado en `build/reports/tests/test/index.html`.

## Descripción de las clases

### Product
Representa un producto con identificador, nombre y precio.

##### Responsabilidad:

Representar un producto con los campos id, name y price.

Validar en el constructor que id y name no sean nulos o vacíos, y que price >= 0.

Getter y setter para cada atributo, con validaciones en los setters.

### ItemCart
Representa un ítem dentro del carrito, asociado a un producto, con cantidad y precio unitario.

Responsabilidad:

Representar un ítem dentro del carrito, asociado a un producto, con cantidad y precio unitario.

Validar en el constructor que productId no sea nulo o vacío, y que cantidad y price >= 0.

Getter y setter para cada atributo, con validaciones en los setters.

### Cart
##### Responsabilidad:

Manejar una lista de ItemCart asociados al carrito de un userId y cartId.

##### Operaciones principales:

addItem(ItemCart item): agrega un ítem (no nulo, sin duplicados).

removeItem(String productId): remueve un ítem existente por su productId.

updateItemQuantity(String productId, int newQuantity): actualiza la cantidad, recalculando subtotal y total.

clearCart(): limpia todos los ítems y restablece totalPrice a 0.

##### Mantiene el campo double totalPrice, que se actualiza en cada operación.

