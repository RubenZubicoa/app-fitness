import { Redirect } from 'expo-router';

/** Redirige a la pestaña de videoteca en la barra de navegación. */
export default function VideotecaRedirect() {
  return <Redirect href="/home/videoteca" />;
}
