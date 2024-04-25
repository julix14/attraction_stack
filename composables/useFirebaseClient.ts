import { getFirestore } from "firebase/firestore";
import { useFirebaseApp } from "vuefire";

export const useFirebaseClient = () => {
  const firebaseApp = useFirebaseApp();

  const firestore = getFirestore(firebaseApp);

  return {
    firestore,
  };
};
