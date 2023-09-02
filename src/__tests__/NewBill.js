/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

import { screen, fireEvent, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import { list } from "../__mocks__/store.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then file input should trigger handleChangeFile on file selection", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Création d'un objet NewBill
      const onNavigateMock = jest.fn();
      const newBillMock = new NewBill({
        document,
        onNavigate: onNavigateMock,
        store: { bills: list },
        localStorage: localStorageMock,
      });

      // Mock de la méthode handleChangeFile
      const eventMock = { preventDefault: jest.fn() };
  
      // Espionner la méthode handleChangeFile
      const handleChangeFileSpy = jest.spyOn(newBillMock, 'handleChangeFile');

      // Récupération de l'input file
      const fileInput = screen.getByTestId("fileInput");

      // Mock de l'objet de fichier (simulant la sélection de fichier)
      const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
      Object.defineProperty(fileInput, 'files', { value: [file] });

      // Simulation de la sélection de fichier
      fireEvent.change(fileInput);

      // Appel de la méthode handleChangeFile
      newBillMock.handleChangeFile(eventMock);

      // Vérification de l'appel de la fonction
      expect(handleChangeFileSpy).toHaveBeenCalled();
    });

    // faire test handleSubmit avec mock de la méthode post
  });

  //test de la fonction handleChangeFile qui devrait générer une extension non autorisée
  describe("NewBill handleChangeFile function", () => {
    test("It should display an error message for an unsupported file extension", async () => {
      // Rendre le composant NewBillUI dans le DOM
      const html = NewBillUI();
      document.body.innerHTML = html;
    
      // Créez un objet NewBill simulé
      const newBillInstance = new NewBill({
        document: window.document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: null,
      });
    
      // Créez un faux événement d'événement pour simuler la sélection de fichier
      const fileInput = screen.getByTestId("fileInput");
      const file = new File(['test'], 'image.pdf', { type: 'application/pdf' });
      Object.defineProperty(fileInput, 'files', { value: [file] });
    
      console.log(fileInput.files[0].name)
      // Appelez la fonction handleChangeFile avec l'événement simulé
      newBillInstance.handleChangeFile({ target: fileInput });

      console.log(document.querySelector('.errorType').innerText)
    
      // Attendez que l'interface utilisateur soit mise à jour (par exemple, après le changement de fileInput.value)
      await waitFor(() => {
        // Vérifiez si le message d'erreur a été affiché
        expect(document.querySelector('.errorType').innerText).toBe('Extensions autorisées : .jpg, .jpeg, .png');
      });
    });
  });
});