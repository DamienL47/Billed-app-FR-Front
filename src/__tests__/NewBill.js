/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

import { screen, fireEvent, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { list } from "../__mocks__/store.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
// import fireEvent from "@testing-library/user-event";
import router from "../app/Router";

jest.mock("../app/Store", () => mockStore);

// init onNavigate
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};
beforeEach(() => {
  //On simule la connection sur la page Employee en parametrant le localStorage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee',
    email: 'employee@test.tld'
  }))
  // Afficher la page nouvelle note de frais
  document.body.innerHTML = NewBillUI()
})

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
  });

  //test de la fonction handleChangeFile qui devrait générer une extension non autorisée
  test("Then I add a file with the wrong extension, the program must return an error", async () => {
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
  
    // Appelez la fonction handleChangeFile avec l'événement simulé
    newBillInstance.handleChangeFile({ target: fileInput });
  
    // Attendez que l'interface utilisateur soit mise à jour (par exemple, après le changement de fileInput.value)
    await waitFor(() => {
      // Vérifiez si le message d'erreur a été affiché
      expect(document.querySelector('.errorType').innerText).toBe('Extensions autorisées : .jpg, .jpeg, .png');
    });
  });

  test('Then a form with nine fields should be rendered', () => {
    // On récupère le HTML
    document.body.innerHTML = NewBillUI();
    // On récupère le champ 'form'
    const form = document.querySelector('form');
    // On vérifie que la taille du form est égal à 9
    expect(form.length).toEqual(9);
  });
});

describe("NewBill Integration Test Suites", () => {
  describe("Given I am a user connected as an employee", () => {
    describe("When I am on NewBill", () => {
      test("Then I submit completed NewBill form and I am redirected on Bill, methode Post", async() => {
      // route
      document.body.innerHTML = `<div id="root"></div>`;
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      // value for Expense-name
      const expenseName = screen.getByTestId("expense-name")
      expenseName.value = 'vol'
      // value for Datepicker
      const datepicker = screen.getByTestId("datepicker")
      datepicker.value = '2022-08-22'
      // value for Amount
      const amount = screen.getByTestId("amount")
      amount.value = '300'
      // value for Vat
      const vat = screen.getByTestId("vat")
      vat.value ='40'
      // value for Pct
      const pct = screen.getByTestId("pct")
      pct.value ='50'
      // File and fireEvent
      const file = screen.getByTestId("fileInput")
      fireEvent.change(file, {
        target: {
          files: [new File(['image.png'], 'image.png', { type: 'image/png'})],
        },
      })
        // Form Submission
        const formSubmission = screen.getByTestId("form-new-bill");
        const newBillEmulation = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
        const handleSubmit = jest.fn((e) => newBillEmulation.handleSubmit(e));
        // addEventListener on form
        formSubmission.addEventListener("submit", handleSubmit);
        fireEvent.submit(formSubmission);
        expect(handleSubmit).toHaveBeenCalled();

        // Utilisez waitFor pour attendre que le texte apparaisse dans le contenu
        await waitFor(() => {
          expect(screen.getByText("Mes notes de frais")).toBeInTheDocument();
        });

        // Ensuite, vous pouvez effectuer vos autres assertions, par exemple :
        expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
      });
    })
  })
})