import Numeral from 'numeral';

const _ = {};

export function capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}


export  function number_formatter(num) {
    return Numeral(num).format('0,0');
}


export function skills_formatter(skill){
    let formattedSkill = skill;
    switch(skill) {
        case 'Risktaking': 
            formattedSkill = 'Risk taking';
            break;
    }
    return formattedSkill;
}



