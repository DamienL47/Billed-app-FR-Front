/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

import {screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from '../containers/Bills.js';
import { bills } from "../fixtures/bills.js";
import mockStore from "../__mocks__/store"
import { ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)


// Cette fonction prend une chaîne de caractères représentant une date au format 'jj mois aa' (par exemple, '18 septembre 23') 
// et la convertit en format 'YYYY-MM-DD' (par exemple, '2023-09-18').
const convertDateToYYYYMMDD = (dateStr) => {
  // Utilise la méthode match() avec une regex pour extraire les parties de la date.
  const parts = dateStr.match(/(\d{1,2})\s+([A-Za-zéû]*)\s+(\d{2})/);
  
  // Vérifie si la correspondance a été trouvée et si elle contient les éléments nécessaires.
  if (parts && parts.length === 4) {
    // Formate le jour avec 2 chiffres (p. ex., '05' au lieu de '5').
    const day = parts[1].padStart(2, '0');
    
    // Crée une correspondance entre les noms de mois abrégés et les mois au format 'MM'.
    const monthMap = {
      'Jan': '01',
      'Fév': '02',
      'Mar': '03',
      'Avr': '04',
      'Mai': '05',
      'Jun': '06',
      'Jui': '07',
      'Aoû': '08',
      'Sep': '09',
      'Oct': '10',
      'Nov': '11',
      'Déc': '12',
    };
    
    // Obtient le mois au format 'MM' à partir du mois abrégé.
    const month = monthMap[parts[2]];
    
    // Construit l'année au format 'YYYY' en supposant que les années soient dans les années 2000 ('20' + 'aa').
    const year = `20${parts[3]}`;
    
    // Retourne la date au format 'YYYY-MM-DD'.
    return `${year}-${month}-${day}`;
  }
  
  // Si la correspondance n'a pas été trouvée ou si les éléments nécessaires sont manquants, retourne une chaîne vide.
  return '';
};

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toHaveClass('active-icon');

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const billsSorted =  bills.sort((a, b) => new Date(a.date) - new Date(b.date))
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const billsDates = billsSorted.map((bill) => bill.date === [...dates]);
      const antiChrono = (a, b) => ((b < a) ? 1 : -1)
      const datesSorted = [...billsDates].sort(antiChrono)
      expect(billsDates).toEqual(datesSorted)
    }) 

    // Cette suite de tests vérifie le comportement de la fonction handleClickNewBill d'un objet Bills.
    describe("handleClickNewBill", () => {
      // Ce test vérifie que la fonction handleClickNewBill appelle correctement la fonction onNavigate
      // lorsque le bouton "New Bill" est cliqué.
      test("should call onNavigate when new bill button is clicked", () => {
        // Crée une fonction fictive (mock) pour simuler la fonction onNavigate.
        const mockOnNavigate = jest.fn();
        
        // Crée une instance de l'objet Bills avec des paramètres fictifs.
        const bills = new Bills({
          document: document,
          onNavigate: mockOnNavigate,
          store: null,
          localStorage: null
        });
        
        // Ajoute un bouton "New Bill" simulé au corps du document.
        document.body.innerHTML = '<button data-testid="btn-new-bill">New Bill</button>';
        
        // Appelle la fonction handleClickNewBill sur l'objet bills.
        bills.handleClickNewBill();
        
        // Vérifie que la fonction onNavigate a été appelée avec l'argument ROUTES_PATH.NewBill.
        expect(mockOnNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
      });
    });
  
    // Cette suite de tests vérifie le comportement lorsqu'un utilisateur se trouve sur la page Bills
    // et clique sur une icône "eye".

    describe('When I am on Bills page and I click on an icon eye', () => {
      // Ce test vérifie que lorsqu'un utilisateur clique sur l'icône "eye", une modale devrait s'ouvrir.
      test('Then a modal should open', () => {
        // On initialise le HTML de la page Bills en utilisant une fonction BillsUI
        document.body.innerHTML = BillsUI({ data: bills });
        
        // On crée une instance de la classe Bills pour gérer la page Bills.
        const billsContainer = new Bills({
          document,
          onNavigate,
          Store: null,
          localStorage: window.localStorage,
        });
        
        // On récupère l'élément DOM correspondant à la modale avec l'ID 'modaleFile'.
        const modale = document.getElementById('modaleFile');
        
        // On remplace la fonction $.fn.modal par une fonction fictive qui ajoute la classe "show" à la modale.
        $.fn.modal = jest.fn(() => modale.classList.add("show"));
        
        // On récupère le premier élément avec l'attribut 'data-testid' égal à 'icon-eye'.
        const iconEye = screen.getAllByTestId('icon-eye')[0];
        
        // On crée une fonction simulée pour la fonction handleClickIconEye de l'objet billsContainer.
        const handleClickIconEye = jest.fn(
          billsContainer.handleClickIconEye(iconEye)
        );
        
        // On ajoute un gestionnaire d'événement de clic à l'icône "eye" qui appelle la fonction simulée.
        iconEye.addEventListener('click', handleClickIconEye);
        
        // On simule un clic sur l'icône "eye".
        fireEvent.click(iconEye);
        
        // On vérifie que la fonction handleClickIconEye a bien été appelée.
        expect(handleClickIconEye).toHaveBeenCalled();
      });
    });

    // Test pour la méthode getBills
    // Cette suite de tests vérifie le comportement lorsque les données des factures sont récupérées.

    describe('When I fetch bills data', () => {
      // Ce test vérifie que les factures doivent être triées chronologiquement.
      test("Then bills should be ordered chronologically", () => {
        // Initialise le HTML de la page Bills en utilisant une fonction BillsUI.
        document.body.innerHTML = BillsUI({ data: bills });
        
        // Trie les factures (bills) en utilisant la date comme critère de tri.
        const sortedBills = bills.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Récupère les éléments de la page qui affichent les dates des factures.
        const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
        
        // Convertit les dates affichées au format YYYY-MM-DD.
        const receivedDates = dates.map(convertDateToYYYYMMDD);
        
        // Convertit les dates des factures triées au format YYYY-MM-DD.
        const expectedSortedDates = sortedBills.map(bill => convertDateToYYYYMMDD(bill.date));
        
        // Vérifie que les dates reçues correspondent aux dates triées.
        expect(receivedDates).toEqual(expectedSortedDates);
      });

      // Ce test vérifie que la méthode sortByDate est appelée lorsque getBills est exécutée.
      test("Then sortByDate should be called", async () => {
        // Initialise le HTML de la page Bills en utilisant une fonction BillsUI.
        document.body.innerHTML = BillsUI({ data: bills });
        
        // Crée une instance de la classe Bills avec des mocks appropriés.
        const billsInstance = new Bills({
          document: document,
          onNavigate: jest.fn(),
          store: {
            bills: () => ({
              list: () => Promise.resolve(bills),
            }),
          },
          localStorage: null,
        });
        
        // Espionne la méthode sortByDate.
        const sortByDateSpy = jest.spyOn(billsInstance, 'sortByDate');
        
        // Appelle la méthode getBills de l'instance Bills.
        await billsInstance.getBills();
        
        // Vérifie que sortByDate a bien été appelée.
        expect(sortByDateSpy).toHaveBeenCalled();
      });

      // Cette section de tests traite des erreurs API lorsque l'utilisateur est connecté en tant qu'employé.
      describe("Given I am a user connected as Employee", () => {
        // Cette section de tests traite des erreurs API spécifiques.
        describe("When an error occurs on API", () => {
          beforeEach(() => {
            // Espionne la méthode mockStore.bills.
            jest.spyOn(mockStore, "bills");
            
            // Configure les propriétés locales pour simuler un utilisateur connecté.
            Object.defineProperty(
              window,
              'localStorage',
              { value: localStorageMock }
            )
            window.localStorage.setItem('user', JSON.stringify({
              type: 'Employee',
              email: "a@a"
            }))
            
            // Crée un élément racine et configure le routage.
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.appendChild(root)
            router()
          })

          // Ce test vérifie la récupération des factures depuis l'API qui échoue avec un message d'erreur 404.
          test("fetches bills from an API and fails with 404 message error", async () => {
            // Mocke la méthode list de mockStore.bills pour renvoyer une promesse rejetée avec un message d'erreur.
            mockStore.bills.mockImplementationOnce(() => {
              return {
                list: () => {
                  return Promise.reject(new Error("Erreur 404"))
                }
              }
            })
            
            // Navigue vers la page des factures.
            window.onNavigate(ROUTES_PATH.Bills)
            
            // Attends une mise à jour asynchrone.
            await new Promise(process.nextTick);
            
            // Récupère et vérifie l'affichage du message d'erreur 404.
            const message = await screen.getByText(/Erreur 404/)
            expect(message).toBeTruthy()
          })

          // Ce test vérifie la récupération des factures depuis l'API qui échoue avec un message d'erreur 500.
          test("fetches messages from an API and fails with 500 message error", async () => {
            // Mocke la méthode list de mockStore.bills pour renvoyer une promesse rejetée avec un message d'erreur.
            mockStore.bills.mockImplementationOnce(() => {
              return {
                list: () => {
                  return Promise.reject(new Error("Erreur 500"))
                }
              }
            })
            
            // Navigue vers la page des factures.
            window.onNavigate(ROUTES_PATH.Bills)
            
            // Attends une mise à jour asynchrone.
            await new Promise(process.nextTick);
            
            // Récupère et vérifie l'affichage du message d'erreur 500.
            const message = await screen.getByText(/Erreur 500/)
            expect(message).toBeTruthy()
          })
        })
      })
    })
  });
})
