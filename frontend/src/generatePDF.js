const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePDF = (userData) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Output the PDF to a file
  doc.pipe(fs.createWriteStream(path.join(__dirname, 'Contrato.pdf')));

  // Set font and color for the title
  doc
    .fontSize(20)
    .fillColor('#F15A22')
    .text('Bienvenid@ a:', { align: 'center' });

  // Add the logo below the title
  doc.image(path.join(__dirname, 'assets', 'logo-dorian.png'), {
    width: 150,
    align: 'center',
  });
  doc.moveDown();

  // Set font and color for the text
  doc.fontSize(12).fillColor('black');

  // Add the contract text in two columns
  const text = `
    1. Normas de Funcionamiento:
    1.1. Está prohibido fumar dentro de las instalaciones.
    1.2. El consumo del alcohol o sustancias sujetas a fiscalización está terminantemente prohibido en las instalaciones.
    1.3. No se permite el consumo de alimentos dentro de las instalaciones, salvo en las zonas expresamente habilitadas para ello.
    1.4. Está prohibida Ja entrada de animales a las instalaciones.
    1.5. Se deberá usar ropa y calzados adecuados para las actividades y servicios prestados.
    1.6. Se habrá de dejar los equipos y las instalaciones en las condiciones que se las encontró previo al uso, es decir, sin sudor, sin residuos de ningún tipo libres disponibles para el resto de usuarios.
    1.7. Se deberá hacer uso correcto del equipamiento e implementos del gimnasio, siendo responsable el usuario de cualquier deterioro que se causase por uso indebido.
    1.8. La sustracción y/o destrucción o dañó material de cualquier equipo o implemento de la instalación, significará la expulsión automática de las instalaciones, sin perjuicio de las acciones civiles y penales que puedan derivar.
    1.9. Debe respetarse la higiene de las instalaciones, haciendo el uso debido de papeleras de reciclaje para depositar los desperdicios de cualquier tipo.
    1.10. Se respetarán los horarios establecidos para las actividades en las instalaciones.
    1.11. Se pagará de forma puntal y sin retraso la mensualidad requerida.
    1.12. El hecho de permitir pagar fuera de fecha, no implica bajo ninguna circunstancia renuncia a la cantidad debida.
    1.13. El acceso y uso de las instalaciones está reservado únicamente a los usuarios que tengan la calidad de miembro. La participación en la introducción no autorizada de personas ajenas, no se encuentra permitida.
    1.14. Las instalaciones están equipadas con sistemas de vigilancia y seguridad con grabación de imagen, al acceder al presente acuerdo, usted acepta ser grabado.
    1.15. El personal se encargará de velar por el cumplimiento de las normas de conducta y de uso de las instalaciones.
    1.16. Gimnasio Dorian se reserva limitar o impedir el acceso a las instalaciones cuando las circunstancias y/o la seguridad de las personas así lo ameriten.
    1.17. Los implementos y accesorios, deben permanecer en las instalaciones, debiendo dejarse tras su uso en el sitio correcto y en orden.
    1.18. Las recomendaciones o solicitudes que presenten los clientes deberán ser dirigidas de manera escrita a la administración a que puedan ser canalizadas de la mejor manera.
    2. Vestuarios y Casilleros
    2.1. DORIAN GIMNASIO no se responsabiliza de pérdidas, daños materiales, sustracción de dinero o de otros artículos de valor que se deje en los casilleros.
    2.2. No está permitido afeitarse en las duchas por motivos de higiene, sanitarios y de seguridad.
    2.3. Se ruega dejar los vestidores de la misma manera en que fueron encontrados.
    3. Responsabilidad
    3.1. GIMNASIO DORIAN no será responsable de los problemas de salud que pueda sufrir a consecuencia del "mal" uso de nuestras instalaciones o de nuestros programas de ejercicios. Por lo tanto, recomendamos que consulte con un médico antes de contratar nuestros servicios en caso de que tenga la tensión alta, angina de pecho, cardiopatía, diabetes, enfermedad crónica, desmayos y, en general, si concurre cualquier otra circunstancia que afecte a tu salud y forma fisica. Con la suscripción del presente contrato, usted declara que está en buenas condiciones para la realización de ejercicio físico.
    3.2. Adicionalmente, GIMNASIO DORIAN no se hará responsable en caso de lesión debido a:
    A. No prestar atención indicaciones del entrenador.
    B. No realizar la debida preparación corporal para realizar la rutina de entrenamiento, es decir, calentamiento.
    C. Afecciones cutáneas debido al no uso de la toalla.
    D. Utilizar ropa indebida para realizar ejercicio.
    E. Mal uso de las máquinas y demás implementos del Gimnasio.
    F. Ejecución de los ejercicios sin realizar la técnica correctamente.
    G. No haber hecho uso del instructor.
    H. Por no comunicar lesiones o circunstancias de salud anteriores.
    1. Por no utilizar implementos de seguridad durante el entrenamiento, como: cinturón, guantes, vendas, agarraderas, entre otros.
    J. Accidentes ocasionados por terceros, sin perjuicio de la posibilidad de exigirle al causante del daño, la reparación debida.
    K. Irrespeto a los protocolos de las clases grupales.
    L. Ingresar en estado etilico o bajo el efecto sustancias estupefacientes.
    M. Por no haber informado de padecer algún desorden alimenticio o cualquier otra enfermedad.
    N. Por no alimentarse de una manera correcta antes, durante y después de realizar los ejercicios.
    4. Incumplimiento
    4.1. En caso de incumplimiento, GIMNASIO DORIAN se reserva la posibilidad de expulsar a dicho usuario, sin restitución de gastos y sin perjuicio de las acciones legales que pudieran derivar.
    5. Política de Congelamiento de Planes
    Los planes no serán sujetos a devoluciones o extensiones, y tendrán validez durante el tiempo y por el monto acordado.
  `;

  doc.text(text, {
    columns: 2,
    columnGap: 15,
    height: 400,
    width: 465,
    align: 'justify',
  });

  doc.moveDown();

  // Add user details at the end
  doc.text(
    `Yo, ${userData.nombre} ${userData.apellido}, con cédula de ciudadanía ${userData.cedula}, declaro que he leído y acepto los términos y condiciones.`
  );
  doc.text(
    `Fecha: ${new Date(userData.fecha_inscripcion).toLocaleDateString()}`
  );
  doc.text(`Plan contratado: ${userData.plan_contratado}`);
  doc.text(`Dirección: ${userData.direccion}`);
  doc.text(`Teléfono: ${userData.telefono}`);
  doc.text(`Correo: ${userData.correo}`);
  doc.moveDown();
  doc.text('Firma del usuario:');
  doc.image(path.join(__dirname, 'signatures', `${userData.cedula}.png`), {
    fit: [250, 100],
    align: 'left',
  });
  doc.text('Foto del usuario:');
  doc.image(path.join(__dirname, 'photos', `${userData.cedula}.jpg`), {
    fit: [100, 100],
    align: 'left',
  });

  doc.end();
};

// Example usage
const userData = {
  nombre: 'John',
  apellido: 'Doe',
  cedula: '1314613397',
  fecha_inscripcion: new Date(),
  plan_contratado: 'Plan Anual',
  direccion: '123 Main St',
  telefono: '555-555-5555',
  correo: 'john.doe@example.com',
};

generatePDF(userData);
