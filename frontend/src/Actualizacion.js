import React, { useState } from 'react';

const Actualizacion = () => {
  const [cedula, setCedula] = useState('');
  const [userData, setUserData] = useState(null);
  const [firma, setFirma] = useState(null);
  const [foto, setFoto] = useState(null);

  const buscarUsuario = async () => {
  try {
    const response = await fetch(`https://contratos-backend.onrender.com/api/actualizacion/${cedula}`);
    
    if (!response.ok) {
      throw new Error('Usuario no encontrado');
    }

    const data = await response.json();
    setUserData(data);
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    alert('Error al buscar usuario. Verifica que la cédula sea correcta.');
  }
};


  const handleFirmaUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setFirma(reader.result.split(',')[1]);
  };

  const handleFotoUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setFoto(reader.result.split(',')[1]);
  };

  const actualizarDatos = async () => {
    try {
      const response = await fetch(`/api/actualizacion/${cedula}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firma, foto }),
      });

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error('Error al actualizar datos:', error);
    }
  };

  return (
    <div>
      <h2>Actualizar Datos</h2>
      <input
        type="text"
        placeholder="Ingrese su cédula"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
      />
      <button onClick={buscarUsuario}>Buscar</button>

      {userData && (
        <div>
          <p><strong>Nombre:</strong> {userData.nombre} {userData.apellido}</p>
          <p><strong>Plan contratado:</strong> {userData.plan_contratado}</p>
          <p><strong>Fecha de inscripción:</strong> {new Date(userData.fecha_inscripcion).toLocaleDateString()}</p>
          <p><strong>Dirección:</strong> {userData.direccion}</p>
          <p><strong>Teléfono:</strong> {userData.telefono}</p>
          <p><strong>Correo:</strong> {userData.correo}</p>

          <button onClick={() => alert('Mostrando contrato...')}>Ver Contrato</button>

          <div>
            <h3>Firma actual:</h3>
            {userData.firma_blob ? (
              <img src={`data:image/png;base64,${userData.firma_blob}`} alt="Firma del usuario" width="200" />
            ) : (
              <p>No disponible</p>
            )}
            <input type="file" onChange={handleFirmaUpload} />
            <button onClick={() => alert('Firma actualizada')}>Actualizar Firma</button>
          </div>

          <div>
            <h3>Foto actual:</h3>
            {userData.foto_blob ? (
              <img src={`data:image/jpeg;base64,${userData.foto_blob}`} alt="Foto del usuario" width="150" />
            ) : (
              <p>No disponible</p>
            )}
            <input type="file" onChange={handleFotoUpload} />
            <button onClick={() => alert('Foto actualizada')}>Actualizar Foto</button>
          </div>

          <button onClick={actualizarDatos}>Finalizar</button>
        </div>
      )}
    </div>
  );
};

export default Actualizacion;
