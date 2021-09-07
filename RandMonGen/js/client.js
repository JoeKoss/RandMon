document.getElementById("generateButton").onclick = function() {buttonClicked()};
			
function buttonClicked(){
	var cr;
	var crExp;

	if(document.getElementById("1/8").checked){
		cr = document.getElementById("1/8").value;
		crExp = "25 XP"
	}
	if(document.getElementById("1/4").checked){
		cr = document.getElementById("1/4").value;
		crExp = "50 XP"
	}
	if(document.getElementById("1/2").checked){
		cr = document.getElementById("1/2").value;
		crExp = "100 XP"
	}
	if(document.getElementById("1").checked){
		cr = document.getElementById("1").value;
		crExp = "200 XP"
	}
	if(document.getElementById("2").checked){
		cr = document.getElementById("2").value;
		crExp = "450 XP"
	}

	document.getElementById("monName").innerHTML = "New Monster Challenge " + cr;
	document.getElementById("challengeRatingText").innerHTML = "<b>Challenge</b> " + cr + " (" + crExp + ")";
	
	getData(cr);
}

function getData(cr){
	if(cr != null){
		const url = "http://randmon.com:8080/gimmeMon";
		fetch(url, {
			method: "POST",
			headers: {"Content-Type": "text/plain"},
			body: cr
		}).then((response => {
			response.json().then((data) =>{
				let monStatBonuses = generateMonStats(data.monStats);
				printMonSizeType(data.monSize.size, data.monType.type);
				printMonHitPoints(data.monSize.hitDice, data.monStats.minHitDice, data.monStats.maxHitDice, monStatBonuses);
				printMonMovement(data.monMovement.speed);
				printMonAC(data.monStats.maxAC, monStatBonuses);
				printMonSkills(data.monSkills, monStatBonuses);
				printMonSenses(data.monSenses, monStatBonuses[4]);
				printMonResistances(data.monResistances);
				printMonDamageImmunities(data.monDamageImmunities);
				printMonConditionImmunities(data.monCondImmunities);
				printMonAbilities(data.monAbilities, data.monAtks, monStatBonuses, data.monSize.size);
				printMonAttacks(data.monAtks, monStatBonuses);
			});
		}));
		document.getElementById("statBlock").style.display = "block";
	}
	else
		window.confirm("Please select a Challenge Rating.");
}

function printMonSizeType(mSize, mType){
	document.getElementById("monSize").innerHTML = "<i>" + mSize + " " + mType + ", unaligned</i>";
}
function printMonMovement(mSpeed){
	document.getElementById("monSpeed").innerHTML = "<b>Speed</b> " + mSpeed;
}

function printMonHitPoints(mHD, mMinHD, mMaxHD, mStatBonuses){
	var numHD = Math.floor(Math.random() * (mMaxHD - mMinHD + 1) + mMinHD);
	var avgHP = ((numHD * parseInt(mHD.substring(1))) / 2) + mStatBonuses[2] + Math.floor(0.5 * numHD);

	if(mStatBonuses[2] > 0)
		document.getElementById("hitPoints").innerHTML = "<b>Hit Points</b> " + avgHP + " (" + numHD + mHD + 
			" + " + mStatBonuses[2] + ")";
	else if(mStatBonuses[2] == 0)
		document.getElementById("hitPoints").innerHTML = "<b>Hit Points</b> " + avgHP + " (" + numHD + mHD + ")";
	else
		document.getElementById("hitPoints").innerHTML = "<b>Hit Points</b> " + avgHP + " (" + numHD + mHD + 
			" - " + Math.abs(mStatBonuses[2]) + ")";
}

function printMonAC(maxAC, mStatBonuses){
	var randomAC = Math.floor(Math.random() * (maxAC - 10 + 1) + 10);

	if(mStatBonuses[1] < 0 || randomAC <= (10 + mStatBonuses[1]))
		document.getElementById("monAC").innerHTML = "<b>Armor Class</b> " + (10 + mStatBonuses[1]);
	else
		document.getElementById("monAC").innerHTML = "<b>Armor Class</b> " + randomAC + " (natural armor)";
}

//Generate the monster stats
function generateMonStats(mStats){
	var totalStats = Math.floor(Math.random() * (mStats.maxStatTotal - mStats.minStatTotal + 1) + 
		mStats.minStatTotal);
	let statArr = [0,0,0,0,0,0];
	let statBonuses = [0,0,0,0,0,0];
	
	//Semi-randomly assign stats, accounting for general monster balance for target CR.
	while(totalStats > 0){
		var randIndex = Math.floor(Math.random() * 6);

		//The creature is beast-like so CHA should be limited.
		if(randIndex == 5 && statArr[5] == 10){
			//Do nothing and generate another index
			randIndex = Math.floor(Math.random() * 5);
		}
		//Ensure that Str or Dex meets the minimum hit bonus to better balance the monster near the end of stat generation.
		if(totalStats <= 10 && (statBonuses[0] + 2 < mStats.minHitBonus && statBonuses[1] + 2 < mStats.minHitBonus)){
			if(statArr[0] > statArr[1]){
				var targetVal = ((mStats.minHitBonus - 2) * 2) + 10;
				totalStats -= (targetVal - statArr[0]);
				statArr[0] = targetVal;
				statBonuses[0] = mStats.minHitBonus - 2;
			}
			else{
				var targetVal = ((mStats.minHitBonus - 2) * 2) + 10;
				totalStats -= (targetVal - statArr[1]);
				statArr[1] = targetVal;
				statBonuses[1] = mStats.minHitBonus - 2;
			}
		}

		//If Con is < 10, try to get 10 or as close to 10 as possible to better balance the monster stats near the end of stat generation.
		else if (totalStats <= 10 && (statArr[2] < 10)){
			if(10 - statArr[2] < totalStats){
				statArr[2] += totalStats;
				totalStats -= totalStats;
				statBonuses[2] = Math.floor((statArr[2] -10) / 2);
			}
			else{
				statArr[2] += 10 - statArr[2];
				totalStats -= 10 - statArr[2];
				statBonuses[2] = 0;
			}
		}
		else if(Math.floor((statArr[randIndex] - 10) / 2) < mStats.maxStatBonus){
			statArr[randIndex] += 1;
			statBonuses[randIndex] = Math.floor((statArr[randIndex] - 10) / 2);
			totalStats -= 1;
		}
	}

	printMonStats(statArr, statBonuses);
	return statBonuses;
}

//Print the monster stats
function printMonStats(statArr, statBonuses){
	if(Math.floor((statArr[0] - 10) / 2) >= 0)
		document.getElementById("strScore").innerHTML = statArr[0] + " (+" + statBonuses[0] + ")";
	else
		document.getElementById("strScore").innerHTML = statArr[0] + " (" + statBonuses[0] + ")";
	
	if(Math.floor((statArr[1] - 10) / 2) >= 0)
		document.getElementById("dexScore").innerHTML = statArr[1] + " (+" + statBonuses[1] + ")";
	else
		document.getElementById("dexScore").innerHTML = statArr[1] + " (" + statBonuses[1] + ")";
	
	if(Math.floor((statArr[2] - 10) / 2) >= 0)
		document.getElementById("conScore").innerHTML = statArr[2] + " (+" + statBonuses[2] + ")";
	else
		document.getElementById("conScore").innerHTML = statArr[2] + " (" + statBonuses[2] + ")";
	
	if(Math.floor((statArr[3] - 10) / 2) >= 0)
		document.getElementById("intScore").innerHTML = statArr[3] + " (+" + statBonuses[3] + ")";
	else
		document.getElementById("intScore").innerHTML = statArr[3] + " (" + statBonuses[3] + ")";
	
	if(Math.floor((statArr[4] - 10) / 2) >= 0)
		document.getElementById("wisScore").innerHTML = statArr[4] + " (+" + statBonuses[4] + ")";
	else
		document.getElementById("wisScore").innerHTML = statArr[4] + " (" + statBonuses[4] + ")";
	
	if(Math.floor((statArr[5] - 10) / 2) >= 0)
		document.getElementById("chaScore").innerHTML = statArr[5] + " (+" + statBonuses[5] + ")";
	else
		document.getElementById("chaScore").innerHTML = statArr[5] + " (" + statBonuses[5] + ")";
}

function printMonSkills(mSkills, mStatBonuses){
	document.getElementById("monSkills").innerHTML = "";
	if(mSkills != null){
		document.getElementById("monSkills").innerHTML = "<b>Skills</b> " + mSkills[0].skill;
		if(2 + mStatBonuses[mSkills[0].statBonus] >= 0)
			document.getElementById("monSkills").innerHTML += " +" + (2 + mStatBonuses[mSkills[0].statBonus]);
		else
			document.getElementById("monSkills").innerHTML += " " + (2 + mStatBonuses[mSkills[0].statBonus]);

		if(mSkills.length == 2){
			document.getElementById("monSkills").innerHTML += ", " + mSkills[1].skill;
			if(2 + mStatBonuses[mSkills[1].statBonus] >= 0)
				document.getElementById("monSkills").innerHTML += " +" + (2 + mStatBonuses[mSkills[1].statBonus]);
			else
				document.getElementById("monSkills").innerHTML += " " + (2 + mStatBonuses[mSkills[1].statBonus]);
		}
	}
}

function printMonSenses(mSenses, wisMod){
	document.getElementById("monSenses").innerHTML = "<b>Senses</b> ";
	if(mSenses.length == 2)
		document.getElementById("monSenses").innerHTML += mSenses[0].sense + " " + mSenses[0].senseRange + ", " + mSenses[1].sense + " " + (10 + wisMod);
	else
		document.getElementById("monSenses").innerHTML += mSenses[0].sense + " " + (10 + wisMod);
}

function printMonResistances(mRes){
	document.getElementById("monResistances").innerHTML = "";
	if(!(mRes == null)){
		document.getElementById("monResistances").innerHTML = "<b>Damage Resistances</b> ";
		for(i=0; i<mRes.length; i++){
			document.getElementById("monResistances").innerHTML += mRes[i].resistance;
			if(i+1 != mRes.length){
				if(mRes[i+1].resID == 14)
					document.getElementById("monResistances").innerHTML += "; ";
				else
					document.getElementById("monResistances").innerHTML += ", ";
			}
		}
	}
}

function printMonDamageImmunities(mImm){
	document.getElementById("monDamageImmunities").innerHTML = "";
	if(!(mImm == null)){
		document.getElementById("monDamageImmunities").innerHTML = "<b>Damage Immunities</b> ";
		for(i=0; i<mImm.length; i++){
			document.getElementById("monDamageImmunities").innerHTML += mImm[i].resistance;
			if(i+1 != mImm.length){
				if(mImm[i+1].resID == 14)
					document.getElementById("monDamageImmunities").innerHTML += "; ";
				else
					document.getElementById("monDamageImmunities").innerHTML += ", ";
			}
		}
	}
}

function printMonConditionImmunities(mCond){
	document.getElementById("conditionImmunities").innerHTML = "";
	if(!(mCond == null)){
		document.getElementById("conditionImmunities").innerHTML = "<b>Condition Immunities</b> ";
		for(i=0; i<mCond.length; i++){
			document.getElementById("conditionImmunities").innerHTML += mCond[i].condition;
			if(i+1 != mCond.length){
				document.getElementById("conditionImmunities").innerHTML += ", ";
			}
		}
	}
}

function printMonAbilities(mAbils, mAtks, mStatBonuses, mSize){
	let atkArr = getAtkArr(mAtks);
	document.getElementById("abilityHR").style.display = "none";
	document.getElementById("monAbility1").innerHTML = "";
	document.getElementById("monAbility2").innerHTML = "";
	if(!(mAbils == null)){
		document.getElementById("abilityHR").style.display = "block";
		printMonAbilityData(mAtks, mAbils[0], mStatBonuses, mSize, 1);
		if(mAbils.length > 1)
			printMonAbilityData(mAtks, mAbils[1], mStatBonuses, mSize, 2);
	}
}

function printMonAbilityData(mAtks, mAbil, mStatBonuses, mSize, abilNum){
	if(mAbil.abilityEffect.includes("$ Strength"))
		mAbil.abilityEffect = mAbil.abilityEffect.replace("$", "DC " + (10+mStatBonuses[0]) + "");
	if(mAbil.abilityEffect.includes("@"))
		mAbil.abilityEffect = mAbil.abilityEffect.replace("@", (mAtks[0].atkName) + "");
	if(mAbil.abilityEffect.includes("%"))
		mAbil.abilityEffect = mAbil.abilityEffect.replace("%", (mAtks[0].atkAvgDamage) + " (" + mAtks[0].atkDamageDie +") " + 
			mAtks[0].atkDamageType + " damage");
	if(mAbil.abilityEffect.includes("Size+1")){
		if(mSize == "Small")
			mAbil.abilityEffect = mAbil.abilityEffect.replace("Size+1", "Medium");
		if(mSize == "Medium")
			mAbil.abilityEffect = mAbil.abilityEffect.replace("Size+1", "Large");
		if(mSize == "Large")
			mAbil.abilityEffect = mAbil.abilityEffect.replace("Size+1", "Huge");
	}

	document.getElementById("monAbility" + abilNum).innerHTML += "<b>" + mAbil.abilityName + ".</b> " + mAbil.abilityEffect;

}
function printMonAttacks(mAtks, mStatBonuses){
	let atkArr = getAtkArr(mAtks);

	document.getElementById("atkMulti").innerHTML = "";
	document.getElementById("monAtk1").innerHTML = "";
	document.getElementById("monAtk2").innerHTML = "";

	if(atkArr.length > 1 && atkArr[0].atkMulti == 1)
		document.getElementById("atkMulti").innerHTML = "<b>Multiattack.</b> The creature makes two attacks: one with its " + atkArr[0].atkName
		+ " and one with its " + atkArr[1].atkName + ".";
	else if(atkArr.length == 1 && atkArr[0].atkMulti == 1)
		document.getElementById("atkMulti").innerHTML = "<b>Multiattack.</b> The creature makes two " + atkArr[0].atkName + " attacks.";

	if(atkArr.length > 1){
		printMonAttackData(atkArr[0], mStatBonuses, 1);
		printMonAttackData(atkArr[1], mStatBonuses, 2);
	}
	else
		printMonAttackData(atkArr[0], mStatBonuses, 1);
}

function printMonAttackData(mAtk, mStatBonuses, atkNum){
	var statBonus = 0;

	//If strength bonus is non-negative or strength is more than dex, use strength
	if(mStatBonuses[0] > 0 || mStatBonuses[0] > mStatBonuses[1])
		statBonus = mStatBonuses[0];
	else
		statBonus = mStatBonuses[1];
	
	if(statBonus > 0)
		document.getElementById("monAtk" + atkNum).innerHTML = "<b>" + mAtk.atkName + ".</b> " + mAtk.atkType + 
			" Weapon Attack: +" + (2 + statBonus) + " to hit, reach " + mAtk.atkRange + "., " + mAtk.atkTargets + 
			". Hit: " + (mAtk.atkAvgDamage + statBonus) + " (" + mAtk.atkDamageDie + " + " + statBonus + ") " + 
			mAtk.atkDamageType + " damage";
	else if(statBonus == 0)
		document.getElementById("monAtk" + atkNum).innerHTML = "<b>" + mAtk.atkName + ".</b> " + mAtk.atkType + 
			" Weapon Attack: +" + (2 + statBonus) + " to hit, reach " + mAtk.atkRange + "., " + mAtk.atkTargets + 
			". Hit: " + (mAtk.atkAvgDamage + statBonus) + " (" + mAtk.atkDamageDie +") " + 
			mAtk.atkDamageType + " damage";
	else
		document.getElementById("monAtk" + atkNum).innerHTML = "<b>" + mAtk.atkName + ".</b> " + mAtk.atkType + 
			" Weapon Attack: +" + (2 + statBonus) + " to hit, reach " + mAtk.atkRange + "., " + mAtk.atkTargets + 
			". Hit: " + (mAtk.atkAvgDamage + statBonus) + " (" + mAtk.atkDamageDie + " - " + Math.abs(statBonus)
			 + ") " + mAtk.atkDamageType + " damage";

	if(mAtk.atkEffect != null){
		if(mAtk.atkEffect.includes("$ Constitution"))
			mAtk.atkEffect = mAtk.atkEffect.replace("$", (10+mStatBonuses[2]) + "");
		if(mAtk.atkEffect.includes("$ Strength"))
			mAtk.atkEffect = mAtk.atkEffect.replace("$", (10+mStatBonuses[0]) + "");
		if(mAtk.atkEffect.includes("escape DC $"))
			mAtk.atkEffect = mAtk.atkEffect.replace("$", (10+mStatBonuses[0]) + "");
		document.getElementById("monAtk" + atkNum).innerHTML += mAtk.atkEffect;

	}
	else
		document.getElementById("monAtk" + atkNum).innerHTML += ".";
}

function getAtkArr(mAtks){
	let atkArr = [];
	if(mAtks.length == 2){
		atkArr.push(mAtks[0]);
		atkArr.push(mAtks[1]);
	}
	else{
		if(mAtks[0].length == 2){
			atkArr.push(mAtks[0][0]);
			atkArr.push(mAtks[0][1]);
		}
		else
			atkArr.push(mAtks[0]);
	}
	return atkArr;
}