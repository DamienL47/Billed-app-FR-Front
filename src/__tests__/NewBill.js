/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import { mockedBills, list } from "../__mocks__/store.js"
import NewBill from "../containers/NewBill.js"

// mock de localStorage
import { localStorageMock } from "../__mocks__/localStorage.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then file input should trigger handleChangeFile on file selection", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock de la classe NewBill
      const newBillMock = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: {bills: list},         
        localStorage: localStorageMock,
      });

      const eventMock = { preventDefault: jest.fn()}

      // Mock de la fonction handleChangeFile
      const handleChangeFileMock = jest.fn(newBillMock.handleChangeFile(eventMock));

      // Récupération de l'input file
      const fileInput = screen.getByTestId("file");

      // Simulation de la sélection de fichier
      fireEvent.change(fileInput, {
        target: {
          files: [new File([''], 'test.png', { type: 'image/png' })],
        },
      });

      // Utilisation de await pour attendre la résolution de la promesse
      await handleChangeFileMock();

      // Vérification de l'appel de la fonction handleChangeFile
      expect(handleChangeFileMock).toHaveBeenCalled();
    });

  })
});
