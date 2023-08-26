import React, { useState } from 'react';
import { fireStore } from "./firebase-config.js";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";


export async function fetchDataByCollection(collectionName : string) {

    const collectionRef = collection(fireStore, collectionName);
    const promise = await getDocs(collectionRef);
    
    return promise;
};

export async function fetchDataById(collectionName : string, idCollection : string) {

    const filterCollection = doc(fireStore, collectionName, idCollection);
    const promise = await getDoc(filterCollection);
    
    return promise;
};

export async function fetchDataByShift(collectionName : string, shift : string) {
    
    const collectionRef = collection(fireStore, collectionName);
    const filterCollection = query(collectionRef, where('shift', '==', shift));
    const promise = await getDocs(filterCollection);
    
    return promise;
};

export async function fetchDataByCategory(collectionName : string, category : string) {
    
    const collectionRef = collection(fireStore, collectionName);
    const filterCollection = query(collectionRef, where('category', '==', category));
    const promise = await getDocs(filterCollection);
    
    return promise;
};

export async function fetchJobByRoomID(collectionName : string, RoomID : string) {
    
    const collectionRef = collection(fireStore, collectionName);
    const filterCollection = query(collectionRef, where('room', '==', RoomID), where('status', '==', 'unfinished'));
    const promise = await getDocs(filterCollection);
    
    return promise;
};

export async function fetchDataByRole(collectionName : string, role : string) {
    
    const collectionRef = collection(fireStore, collectionName);
    const filterCollection = query(collectionRef, where('role', '==', role));
    const promise = await getDocs(filterCollection);
    
    return promise;
};

export async function fetchReportByDivision(collectionName : string, role : string) {
    
    const collectionRef = collection(fireStore, collectionName);
    const filterCollection = query(collectionRef, where('division', '==', role));
    const promise = await getDocs(filterCollection);
    
    return promise;
};

export async function fetchDataByRoomID(collectionName : string, roomID : string) {
    
    const collectionRef = collection(fireStore, collectionName);
    const filterCollection = query(collectionRef, where('roomID', '==', roomID));
    const promise = await getDocs(filterCollection);
    
    return promise;
};

export async function fetchBedsByRoomID(collectionName : string, roomID : string) {
    
    const collectionRef = collection(fireStore, collectionName);
    const filterCollection = query(collectionRef, where('roomID', '==', roomID));
    const promise = await getDocs(filterCollection);
    
    return promise;
};

export async function fetchBillByPatientID(collectionName : string, patientID : string) {
    
    const collectionRef = collection(fireStore, collectionName);
    const filterCollection = query(collectionRef, where('patientID', '==', patientID));
    const promise = await getDocs(filterCollection);
    
    console.log(collectionName);
    console.log(patientID);
    console.log(promise.docs);
    return promise;
};

export async function fetchDataStartWith(collectionName: string, firstLetter: string) {
    const collectionRef = collection(fireStore, collectionName);
    const startChar = firstLetter;
    const endChar = String.fromCharCode(startChar.charCodeAt(0) + 1);
  
    const filterCollection = query(
      collectionRef,
      where('roomID', '>=', startChar),
      where('roomID', '<', endChar),
      where('status', '==', 'Available')
    );
  
    const promise = await getDocs(filterCollection);
    return promise;
}
  
export async function fetchPatientByRoomID(collectionName : string, roomID : string, bedNumber : string) {
    
    const collectionRef = collection(fireStore, collectionName);
    const filterCollection = query(collectionRef, where('roomID', '==', roomID), where('bedNumber', '==', bedNumber));
    const promise = await getDocs(filterCollection);
    
    return promise;
};


export async function fetchBedsByCondition(collectionName : string, roomID : string, bedNumber : number) {
    
    const collectionRef = collection(fireStore, collectionName);
    const filterCollection = query(collectionRef, where('roomID', '==', roomID), where('number', '==', bedNumber));
    const promise = await getDocs(filterCollection);
    
    console.log(promise);
    return promise;
};

export async function fetchJobWhichUnfinished(collectionName : string) {
    
    const collectionRef = collection(fireStore, collectionName);
    const filterCollection = query(collectionRef, where('status', '==', 'unfinished'));
    const promise = await getDocs(filterCollection);
    
    console.log(promise);
    return promise;
};

export async function fetchBedStartWith(collectionName : string) {
    
    const collectionRef = collection(fireStore, collectionName);
    const filterCollection = query(collectionRef, where('__name__', '>=', 'A1006'), where('__name__', '<', 'A1007'));
    const promise = await getDocs(filterCollection);
    
    const bedsData = [];
    promise.forEach((doc) => {
      bedsData.push(doc.data());
    });
  
    return bedsData;
};

export async function findAvailableAmbulance() {
    const ambulanceCollectionRef = collection(fireStore, 'ambulance');
    const q = query(ambulanceCollectionRef, where('status', '==', 'available'));

    try {
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
        const firstAvailableAmbulance = {
            id: querySnapshot.docs[0].id,
            data: querySnapshot.docs[0].data()
        };  
        console.log('First available ambulance found:');
        console.log(firstAvailableAmbulance);
        return firstAvailableAmbulance;
        } else {
        console.log('No available ambulance found.');
        return null;
        }
    } catch (error) {
        console.error('Error fetching ambulance data:', error);
        return null;
    }
};
    