/**
 * ClinicProfile Page (Public)
 *
 * Public-facing clinic profile page.
 * Inspired by Zocdoc clinic profiles and Google Business.
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Clock,
  Calendar,
  Star,
  Users,
  Award,
  ChevronRight,
  Heart,
  Stethoscope,
  Brain,
  Apple,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import type { SpecialtyType } from '@/types';
import {
  MOCK_CLINIC,
  MOCK_PROFESSIONALS,
  type PublicClinic,
  type ClinicProfessional,
} from './clinic.config';

// ============================================================================
// Specialty Configuration
// ============================================================================

const SPECIALTY_CONFIG: Record<
  SpecialtyType,
  { label: string; icon: React.ElementType; color: string }
> = {
  medicina: {
    label: 'Medicina',
    icon: Stethoscope,
    color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30',
  },
  nutricao: {
    label: 'Nutrição',
    icon: Apple,
    color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30',
  },
  psicologia: {
    label: 'Psicologia',
    icon: Brain,
    color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30',
  },
};

// ============================================================================
// Sub-Components
// ============================================================================

const InfoCard: React.FC<{
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, children }) => (
  <div className="p-4 bg-genesis-surface rounded-xl border border-genesis-border-subtle">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-genesis-primary/10 rounded-lg">
        <Icon className="w-5 h-5 text-genesis-primary" />
      </div>
      <h3 className="font-semibold text-genesis-dark">{title}</h3>
    </div>
    <div className="text-genesis-medium text-sm">{children}</div>
  </div>
);

const ProfessionalCard: React.FC<{
  professional: ClinicProfessional;
  clinicSlug: string;
}> = ({ professional, clinicSlug }) => {
  const config = SPECIALTY_CONFIG[professional.specialty];
  const Icon = config.icon;

  return (
    <Link
      to={`/agendar/${clinicSlug}?professional=${professional.id}`}
      className="block p-4 bg-genesis-surface rounded-xl border border-genesis-border-subtle hover:border-genesis-primary/30 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {professional.avatar ? (
            <img
              src={professional.avatar}
              alt={professional.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-genesis-soft flex items-center justify-center">
              <Icon className="w-8 h-8 text-genesis-muted" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-genesis-dark">{professional.name}</h3>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${config.color}`}
          >
            {config.label}
          </span>
          {professional.bio && (
            <p className="text-sm text-genesis-muted mt-2 line-clamp-2">{professional.bio}</p>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-genesis-muted flex-shrink-0" />
      </div>
    </Link>
  );
};

const ServiceItem: React.FC<{ service: string }> = ({ service }) => (
  <div className="flex items-center gap-2 text-sm text-genesis-medium">
    <CheckCircle2 className="w-4 h-4 text-genesis-primary flex-shrink-0" />
    <span>{service}</span>
  </div>
);

// ============================================================================
// Loading Skeleton
// ============================================================================

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-genesis-soft">
      <div className="animate-pulse">
        <div className="h-48 bg-genesis-border-subtle" />
        <div className="max-w-4xl mx-auto px-4 -mt-16">
          <div className="bg-genesis-surface rounded-2xl shadow-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 bg-genesis-soft rounded-xl" />
              <div className="flex-1 space-y-3">
                <div className="h-8 w-48 bg-genesis-soft rounded" />
                <div className="h-4 w-32 bg-genesis-soft rounded" />
                <div className="h-4 w-64 bg-genesis-soft rounded" />
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-genesis-surface rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function ClinicProfile(): React.ReactElement {
  const { clinicSlug } = useParams<{ clinicSlug: string }>();
  const [clinic, setClinic] = useState<PublicClinic | null>(null);
  const [professionals, setProfessionals] = useState<ClinicProfessional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClinic = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setClinic(MOCK_CLINIC);
      setProfessionals(MOCK_PROFESSIONALS);
      setLoading(false);
    };
    loadClinic();
  }, [clinicSlug]);

  if (loading) return <ProfileSkeleton />;

  if (!clinic) {
    return (
      <div className="min-h-screen bg-genesis-soft flex items-center justify-center">
        <div className="text-center p-8">
          <Heart className="w-16 h-16 text-genesis-muted mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold text-genesis-dark mb-2">Clínica não encontrada</h1>
          <p className="text-genesis-muted mb-6">
            Não conseguimos encontrar a clínica que você está procurando.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-genesis-primary text-white rounded-xl hover:bg-genesis-primary/90 transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const fullAddress = `${clinic.address.street}, ${clinic.address.number}${clinic.address.complement ? ` - ${clinic.address.complement}` : ''}, ${clinic.address.neighborhood}, ${clinic.address.city} - ${clinic.address.state}`;

  return (
    <div className="min-h-screen bg-genesis-soft">
      {/* Cover */}
      <div className="h-48 bg-gradient-to-br from-genesis-primary to-genesis-primary/70 relative">
        {clinic.coverImage && (
          <img src={clinic.coverImage} alt="" className="w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-24">
        {/* Main Card */}
        <div className="bg-genesis-surface rounded-2xl shadow-lg -mt-16 relative z-10 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex-shrink-0">
                {clinic.logo ? (
                  <img
                    src={clinic.logo}
                    alt={clinic.name}
                    className="w-24 h-24 rounded-xl object-cover border-4 border-genesis-surface shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-genesis-primary/10 flex items-center justify-center border-4 border-genesis-surface shadow-md">
                    <Heart className="w-12 h-12 text-genesis-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-genesis-dark">{clinic.name}</h1>
                {clinic.rating && (
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-genesis-dark">{clinic.rating}</span>
                    {clinic.reviewCount && (
                      <span className="text-genesis-muted text-sm">
                        ({clinic.reviewCount} avaliações)
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {clinic.specialties.map((specialty) => {
                    const config = SPECIALTY_CONFIG[specialty];
                    const Icon = config.icon;
                    return (
                      <span
                        key={specialty}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>
                    );
                  })}
                </div>
                <p className="text-genesis-medium text-sm mt-4 leading-relaxed">
                  {clinic.description}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-genesis-soft border-t border-genesis-border-subtle">
            <Link
              to={`/agendar/${clinic.slug}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-genesis-primary text-white rounded-xl font-semibold hover:bg-genesis-primary/90 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Agendar Consulta
            </Link>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <InfoCard icon={MapPin} title="Localização">
            <p>{fullAddress}</p>
            <p className="text-genesis-muted mt-1">CEP: {clinic.address.zipCode}</p>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-genesis-primary text-xs font-medium mt-2 hover:underline"
            >
              Ver no mapa <ExternalLink className="w-3 h-3" />
            </a>
          </InfoCard>

          <InfoCard icon={Clock} title="Horário de Funcionamento">
            <div className="space-y-1">
              {clinic.workingHours.map((wh, i) => (
                <div key={i} className="flex justify-between">
                  <span>{wh.day}</span>
                  <span className="font-medium">{wh.hours}</span>
                </div>
              ))}
            </div>
          </InfoCard>

          <InfoCard icon={Phone} title="Contato">
            <p className="font-medium">{clinic.phone}</p>
            <p className="text-genesis-muted">{clinic.email}</p>
            {clinic.website && (
              <a
                href={clinic.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-genesis-primary text-xs font-medium mt-2 hover:underline"
              >
                Visitar site <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </InfoCard>

          <InfoCard icon={Award} title="Sobre">
            <div className="flex items-center gap-4">
              {clinic.foundedYear && (
                <div>
                  <p className="text-lg font-bold text-genesis-dark">
                    {new Date().getFullYear() - clinic.foundedYear}+
                  </p>
                  <p className="text-xs text-genesis-muted">anos</p>
                </div>
              )}
              <div>
                <p className="text-lg font-bold text-genesis-dark">{professionals.length}</p>
                <p className="text-xs text-genesis-muted">profissionais</p>
              </div>
              <div>
                <p className="text-lg font-bold text-genesis-dark">{clinic.services.length}</p>
                <p className="text-xs text-genesis-muted">serviços</p>
              </div>
            </div>
          </InfoCard>
        </div>

        {/* Services */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-genesis-dark mb-4">Nossos Serviços</h2>
          <div className="bg-genesis-surface rounded-xl border border-genesis-border-subtle p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {clinic.services.map((service, i) => (
                <ServiceItem key={i} service={service} />
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-genesis-dark">Nossa Equipe</h2>
            <div className="flex items-center gap-1 text-sm text-genesis-muted">
              <Users className="w-4 h-4" />
              <span>{professionals.length} profissionais</span>
            </div>
          </div>
          <div className="space-y-3">
            {professionals.map((p) => (
              <ProfessionalCard key={p.id} professional={p} clinicSlug={clinic.slug} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 p-6 bg-genesis-primary/5 rounded-2xl border border-genesis-primary/20 text-center">
          <h3 className="text-lg font-bold text-genesis-dark mb-2">
            Pronto para cuidar da sua saúde?
          </h3>
          <p className="text-genesis-medium text-sm mb-4">
            Agende sua consulta online de forma rápida e fácil.
          </p>
          <Link
            to={`/agendar/${clinic.slug}`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-genesis-primary text-white rounded-xl font-semibold hover:bg-genesis-primary/90 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Agendar Agora
          </Link>
        </div>
      </div>
    </div>
  );
}
