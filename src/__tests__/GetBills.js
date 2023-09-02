/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
//test d'intégration de container/Bills.js
import { screen, fireEvent, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { formatDate } from '../app/format.js';
import router from "../app/Router.js";
import Bills from '../containers/Bills.js';
