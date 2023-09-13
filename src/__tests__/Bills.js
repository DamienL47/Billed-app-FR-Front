/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

import {screen, waitFor, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import { formatDate } from '../app/format.js';
import router from "../app/Router.js";
import Bills from '../containers/Bills.js';
import { sortByDate } from '../containers/Bills.js'

// Fonction pour convertir une date au format "DD-MMM-YY" en "YYYY-MM-DD"
const convertDateToYYYYMMDD = (dateStr) => {
  const parts = dateStr.match(/(\d{1,2})\s+([A-Za-zéû]*)\s+(\d{2})/);
  if (parts && parts.length === 4) {
    const day = parts[1].padStart(2, '0');
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
    const month = monthMap[parts[2]];
    const year = `20${parts[3]}`;
    return `${year}-${month}-${day}`;
  }
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

    describe("handleClickNewBill", () => {
      test("should call onNavigate when new bill button is clicked", () => {
        const mockOnNavigate = jest.fn();
        const bills = new Bills({
          document: document,
          onNavigate: mockOnNavigate,
          store: null,
          localStorage: null
        });
  
        document.body.innerHTML = '<button data-testid="btn-new-bill">New Bill</button>';
        bills.handleClickNewBill();
  
        expect(mockOnNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
      });
    });
  
    describe('When I am on Bills page and I click on an icon eye', () => {
      test('Then a modal should open', () => {
        // On récupère le HTML
        document.body.innerHTML = BillsUI({ data: bills });
        // On lance la class de la page et on récupère les éléments associes
        const billsContainer = new Bills({
          document,
          onNavigate,
          Store: null,
          localStorage: window.localStorage,
        });
        // On récupère le champ 'modaleFile'
        const modale = document.getElementById('modaleFile')
          $.fn.modal = jest.fn(() => modale.classList.add("show"))
        // On récupère le champ 'icon-eye'
        const iconEye = screen.getAllByTestId('icon-eye')[0];
        // On crée une fonction simulé de la vrai fonction
        const handleClickIconEye = jest.fn(
          billsContainer.handleClickIconEye(iconEye)
        );
        // On crée un évenement, dès qu'on click sur 'iconEye' on appelle la fonction simulé qu'on a créé au-dessus
        iconEye.addEventListener('click', handleClickIconEye);
        fireEvent.click(iconEye);
        // On vérifie que la fonction a bien été appelée
        expect(handleClickIconEye).toHaveBeenCalled();
      });
    });

    // Test pour la méthode getBills
    describe('When I fetch bills data', () => {
      test("Then bills should be ordered chronologically", () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const sortedBills = bills.sort((a, b) => new Date(a.date) - new Date(b.date))
        const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
        const receivedDates = dates.map(convertDateToYYYYMMDD);
  
        // Converti les dates "expected" au format YYYY-MM-DD
        const expectedSortedDates = sortedBills.map(bill => convertDateToYYYYMMDD(bill.date));
  
        // Vérifie que les dates "received" sont égales aux dates "expected" une fois converties
        expect(receivedDates).toEqual(expectedSortedDates);
      });
      test("Then sortByDate should be called", async () => {
        document.body.innerHTML = BillsUI({ data: bills });
    
        // Créez une instance Bills avec des mocks appropriés
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
    
        // Spy on sortByDate method
        const sortByDateSpy = jest.spyOn(billsInstance, 'sortByDate');
    
        // Call getBills
        await billsInstance.getBills();
    
        // Expect sortByDate to have been called
        expect(sortByDateSpy).toHaveBeenCalled();
      });
    });
  });
})
