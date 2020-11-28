import React from 'react';
import {configure, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import CallOtherScreen from './CallOtherScreen/CallOtherScreen';
import App from './App';
import AppHolder from './AppHolder';
import CallOthersScreen from './CallOtherScreen/CallOtherScreen';


configure({adapter:new Adapter()});

describe('<App/>',()=>{
    let AppComponent;

    beforeEach(()=>{
     AppComponent = shallow(<App/>);
    })

    it('Should show Login button if not logged in', ()=>{
        
        AppComponent.setState({loggedIn:false});
        expect(AppComponent.find('.logInButton')).toHaveLength(1);
    })
    it('Should *NOT* show login button if logged in', ()=>{
        AppComponent.setState({loggedIn:true});
        expect(AppComponent.find('.logInButton')).toHaveLength(0);
    })
    it('Should load <AppHolder> if logged in', ()=>{
        AppComponent.setState({loggedIn:true});
        expect(AppComponent.find(AppHolder)).toHaveLength(1); 
    })
})