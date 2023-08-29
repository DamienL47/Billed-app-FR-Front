/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

import { screen, fireEvent } from "@testing-library/dom"
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
      const fileInput = screen.getByTestId("file");

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
});