import React from 'react';
import { SvgXml } from 'react-native-svg';
import BA from 'country-flag-icons/string/3x2/BA';
import HR from 'country-flag-icons/string/3x2/HR';
import RS from 'country-flag-icons/string/3x2/RS';
import GB from 'country-flag-icons/string/3x2/GB';
import ES from 'country-flag-icons/string/3x2/ES';
import BR from 'country-flag-icons/string/3x2/BR';
import FR from 'country-flag-icons/string/3x2/FR';
import DE from 'country-flag-icons/string/3x2/DE';
import IT from 'country-flag-icons/string/3x2/IT';
import PL from 'country-flag-icons/string/3x2/PL';

const FLAGS = { BA, HR, RS, GB, ES, BR, FR, DE, IT, PL };

export default function FlagIcon({ countryCode, size = 24 }) {
  const svg = FLAGS[countryCode?.toUpperCase()];
  if (!svg) return null;
  // 3x2 ratio
  return <SvgXml xml={svg} width={size * 1.5} height={size} style={{ borderRadius: 3 }} />;
}
