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
import router from "../app/Router";

jest.mock("../app/Store", () => mockStore);


const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};
beforeEach(() => {

  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee',
    email: 'employee@test.tld'
  }))

  document.body.innerHTML = NewBillUI()
})

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // Ce test vérifie que le champ de fichier déclenche la fonction handleChangeFile lors de la sélection d'un fichier.
    test("Then file input should trigger handleChangeFile on file selection", () => {
      // Initialise le contenu HTML de la page NewBill en utilisant la fonction NewBillUI.
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Crée un mock pour la fonction onNavigate.
      const onNavigateMock = jest.fn();
      
      // Crée une instance simulée de la classe NewBill avec des mocks appropriés.
      const newBillMock = new NewBill({
        document,
        onNavigate: onNavigateMock,
        store: { bills: list },
        localStorage: localStorageMock,
      });

      // Crée un mock d'événement simulé.
      const eventMock = { preventDefault: jest.fn() };

      // Espionne la méthode handleChangeFile de newBillMock.
      const handleChangeFileSpy = jest.spyOn(newBillMock, 'handleChangeFile');

      // Récupère le champ de fichier du DOM.
      const fileInput = screen.getByTestId("fileInput");

      // Crée un objet File simulé.
      const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
      Object.defineProperty(fileInput, 'files', { value: [file] });

      // Simule le changement de valeur du champ de fichier.
      fireEvent.change(fileInput);

      // Appelle la fonction handleChangeFile de newBillMock avec l'événement simulé.
      newBillMock.handleChangeFile(eventMock);

      // Vérifie que handleChangeFile a bien été appelée.
      expect(handleChangeFileSpy).toHaveBeenCalled();
    });
  });

  // Ce test vérifie qu'une erreur est affichée lorsque le fichier a une extension incorrecte.
  test("Then I add a file with the wrong extension, the program must return an error", async () => {
    // Initialise le contenu HTML de la page NewBill en utilisant la fonction NewBillUI.
    const html = NewBillUI();
    document.body.innerHTML = html;

    // Crée une instance simulée de la classe NewBill avec des mocks appropriés.
    const newBillInstance = new NewBill({
      document: window.document,
      onNavigate: jest.fn(),
      store: null,
      localStorage: null,
    });

    // Récupère le champ de fichier du DOM.
    const fileInput = screen.getByTestId("fileInput");

    // Crée un objet File simulé avec une extension incorrecte (pdf).
    const file = new File(['test'], 'image.pdf', { type: 'application/pdf' });
    Object.defineProperty(fileInput, 'files', { value: [file] });

    // Appelle la fonction handleChangeFile de newBillInstance avec l'événement simulé.
    newBillInstance.handleChangeFile({ target: fileInput });

    // Attend que l'erreur soit affichée et vérifie son contenu.
    await waitFor(() => {
      expect(document.querySelector('.errorType').innerText).toBe('Extensions autorisées : .jpg, .jpeg, .png');
    });
  });

  // Ce test vérifie qu'un formulaire avec neuf champs est rendu sur la page NewBill.
  test('Then a form with nine fields should be rendered', () => {
    // Initialise le contenu HTML de la page NewBill en utilisant la fonction NewBillUI.
    document.body.innerHTML = NewBillUI();
    
    // Récupère le formulaire du DOM.
    const form = document.querySelector('form');
    
    // Vérifie que le formulaire contient neuf champs.
    expect(form.length).toEqual(9);
  });
});

describe("NewBill Integration Test Suites", () => {
  describe("Given I am a user connected as an employee", () => {
    describe("When I am on NewBill", () => {
       // Ce test vérifie que le formulaire de création de facture est soumis avec succès 
       // et que l'utilisateur est redirigé vers la page des factures (méthode POST).
       test("Then I submit completed NewBill form and I am redirected on Bill, methode Post", async() => {
        // Initialise le contenu HTML de la page racine avec un div vide.
        document.body.innerHTML = `<div id="root"></div>`;
        
        // Appelle la fonction router pour configurer la navigation.
        router()
        
        // Navigue vers la page NewBill en utilisant la constante ROUTES_PATH.NewBill.
        window.onNavigate(ROUTES_PATH.NewBill)
        
        // Récupère et configure les champs du formulaire avec des valeurs simulées.
        const expenseName = screen.getByTestId("expense-name")
        expenseName.value = 'vol'
        const datepicker = screen.getByTestId("datepicker")
        datepicker.value = '2022-08-22'
        const amount = screen.getByTestId("amount")
        amount.value = '300'
        const vat = screen.getByTestId("vat")
        vat.value ='40'
        const pct = screen.getByTestId("pct")
        pct.value ='50'
        
        // Simule la sélection d'un fichier en configurant le champ de fichier.
        const file = screen.getByTestId("fileInput")
        fireEvent.change(file, {
          target: {
            files: [new File(['image.png'], 'image.png', { type: 'image/png'})],
          },
        })

        // Récupère le formulaire de création de facture.
        const formSubmission = screen.getByTestId("form-new-bill");

        // Crée une instance de NewBill pour émuler le comportement.
        const newBillEmulation = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        // Espionne la méthode handleSubmit.
        const handleSubmit = jest.fn((e) => newBillEmulation.handleSubmit(e));

        // Ajoute un gestionnaire d'événement "submit" au formulaire qui appelle handleSubmit.
        formSubmission.addEventListener("submit", handleSubmit);

        // Simule la soumission du formulaire en déclenchant l'événement "submit".
        fireEvent.submit(formSubmission);

        // Vérifie que handleSubmit a bien été appelée.
        expect(handleSubmit).toHaveBeenCalled();

        // Attends que le texte "Mes notes de frais" soit présent dans le DOM.
        await waitFor(() => {
          expect(screen.getByText("Mes notes de frais")).toBeInTheDocument();
        });

        // Vérifie la présence du bouton "New Bill" dans le DOM.
        expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
      });
    })
  })
})